import axios from 'axios';

/**
 * Thin wrapper around bKash's Tokenized Checkout (v1.2.0-beta) REST API.
 * Docs: https://developer.bka.sh (sandbox self-registration available there)
 *
 * Flow: grantToken -> createPayment -> (user pays on bKash's hosted page) ->
 * executePayment (on callback) -> queryPayment (optional status check).
 *
 * The id_token is cached in-memory and refreshed automatically when it
 * expires (bKash tokens are valid for 3600s), so callers never have to
 * think about auth, and donors never see a "buffering"/hanging screen
 * while a fresh admin request re-authenticates.
 */

const BASE_URL = process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout';

let cachedToken = null; // { idToken, refreshToken, expiresAt }

const isConfigured = () =>
  Boolean(process.env.BKASH_USERNAME && process.env.BKASH_PASSWORD && process.env.BKASH_APP_KEY && process.env.BKASH_APP_SECRET);

const baseHeaders = (idToken) => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  authorization: idToken,
  'x-app-key': process.env.BKASH_APP_KEY,
});

async function grantToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.idToken;
  }

  const { data } = await axios.post(
    `${BASE_URL}/token/grant`,
    {
      app_key: process.env.BKASH_APP_KEY,
      app_secret: process.env.BKASH_APP_SECRET,
    },
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        username: process.env.BKASH_USERNAME,
        password: process.env.BKASH_PASSWORD,
      },
    }
  );

  if (!data?.id_token) {
    throw new Error(data?.msg || 'bKash token grant failed');
  }

  cachedToken = {
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (Number(data.expires_in || 3600) * 1000),
  };

  return cachedToken.idToken;
}

export async function createPayment({ amount, invoiceNumber, callbackURL }) {
  if (!isConfigured()) {
    const err = new Error(
      'bKash এখনো কনফিগার করা হয়নি। backend/.env এ BKASH_USERNAME, BKASH_PASSWORD, BKASH_APP_KEY, BKASH_APP_SECRET বসান (developer.bka.sh থেকে sandbox ক্রেডেনশিয়াল নিন)।'
    );
    err.statusCode = 503;
    throw err;
  }

  const idToken = await grantToken();
  const { data } = await axios.post(
    `${BASE_URL}/create`,
    {
      mode: '0011',
      payerReference: invoiceNumber,
      callbackURL: callbackURL || process.env.BKASH_CALLBACK_URL,
      amount: String(amount),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: invoiceNumber,
    },
    { headers: baseHeaders(idToken) }
  );
  return data;
}

export async function executePayment(paymentID) {
  const idToken = await grantToken();
  const { data } = await axios.post(`${BASE_URL}/execute`, { paymentID }, { headers: baseHeaders(idToken) });
  return data;
}

export async function queryPayment(paymentID) {
  const idToken = await grantToken();
  const { data } = await axios.post(`${BASE_URL}/payment/status`, { paymentID }, { headers: baseHeaders(idToken) });
  return data;
}

export default { createPayment, executePayment, queryPayment, isConfigured };
