import 'dotenv/config';
import connectDB from '../config/db.js';
import Admin from '../models/Admin.js';
import mongoose from 'mongoose';

const run = async () => {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || 'admin@masjid.com').toLowerCase();
  const existing = await Admin.findOne({ email });

  if (existing) {
    console.log(`[Seed] Admin already exists: ${email}. Skipping.`);
  } else {
    await Admin.create({
      name: process.env.ADMIN_NAME || 'Admin',
      email,
      password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
    });
    console.log(`[Seed] Admin created -> email: ${email} / password: ${process.env.ADMIN_PASSWORD || 'ChangeMe123!'}`);
    console.log('[Seed] Please log in and change this password immediately.');
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
