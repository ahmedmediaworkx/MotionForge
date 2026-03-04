import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Check if user has required plan
export const requirePlan = (...allowedPlans) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!allowedPlans.includes(req.user.plan)) {
      return res.status(403).json({
        success: false,
        message: `This feature requires ${allowedPlans.join(' or ')} plan`,
        requiredPlan: allowedPlans[0],
        currentPlan: req.user.plan
      });
    }

    next();
  };
};

// Check feature limits
export const checkLimits = async (req, res, next) => {
  const user = req.user;

  // Check project limit
  if (user.plan === 'free') {
    const projectCount = await req.app.locals.Project?.countDocuments({ user: user._id }) || 0;
    if (projectCount >= user.projectLimit) {
      return res.status(403).json({
        success: false,
        message: 'Project limit reached. Upgrade to create more projects.',
        limit: user.projectLimit,
        current: projectCount
      });
    }
  }

  next();
};

// Generate tokens
export const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  return { accessToken, refreshToken };
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production'
  );
};