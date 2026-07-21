const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Checks that a valid JWT was sent, attaches the user to req.user
const protect = async (req, res, next) => {
  let token;

  // Tokens are sent as: Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user (minus password) to the request object
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found, authorization denied' });
      }

      next(); // token is valid, continue to the actual route handler
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Restricts a route to specific roles, e.g. authorize('admin', 'owner')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role '${req.user.role}' is not allowed to access this resource` });
    }
    next();
  };
};

module.exports = { protect, authorize };