import asyncHandler from 'express-async-handler';
import Admin from '../models/Admin.js';
import generateToken from '../utils/generateToken.js';

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

// @desc    Admin login (single-admin system) — resolves in one round trip,
//          no extra "check session" call, so the UI can redirect immediately.
// @route   POST /api/auth/login
// @access  Public
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('ইমেইল ও পাসওয়ার্ড দিন (Email and password are required)');
  }

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

  if (admin && (await admin.matchPassword(password))) {
    const token = generateToken(admin._id);
    res
      .cookie('token', token, cookieOptions())
      .status(200)
      .json({ success: true, token, admin: admin.toSafeObject() });
  } else {
    res.status(401);
    throw new Error('ভুল ইমেইল অথবা পাসওয়ার্ড (Invalid email or password)');
  }
});

// @desc    Get currently logged-in admin (used to restore session instantly on refresh)
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, admin: req.admin.toSafeObject() });
});

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
export const logoutAdmin = asyncHandler(async (req, res) => {
  res.clearCookie('token', cookieOptions());
  res.status(200).json({ success: true, message: 'লগআউট সফল হয়েছে' });
});

// @desc    Update admin profile / password
// @route   PUT /api/auth/update
// @access  Private
export const updateAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id);
  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }

  admin.name = req.body.name || admin.name;
  admin.email = req.body.email ? req.body.email.toLowerCase().trim() : admin.email;
  if (req.body.password) {
    admin.password = req.body.password;
  }

  const updated = await admin.save();
  res.status(200).json({ success: true, admin: updated.toSafeObject() });
});
