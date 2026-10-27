import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import Admin from '../models/Admin.js';

// Verifies the JWT (from the Authorization header OR the httpOnly cookie),
// attaches req.admin, and rejects instantly on failure so the client never
// hangs waiting for a slow/failed auth check.
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error('অনুমোদন ব্যর্থ হয়েছে, টোকেন পাওয়া যায়নি (Not authorized, no token)');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded.id).select('-password');
    if (!req.admin) {
      res.status(401);
      throw new Error('অনুমোদন ব্যর্থ হয়েছে (Admin not found)');
    }
    next();
  } catch (error) {
    res.status(401);
    throw new Error('অনুমোদন ব্যর্থ হয়েছে, টোকেন সঠিক নয় (Not authorized, token invalid)');
  }
});

export default protect;
