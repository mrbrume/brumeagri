const express = require('express');
const router = express.Router();
const { registerUser, loginUser, createAdmin, deleteMyAccount } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validators');

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/create-admin', createAdmin);
router.delete('/me', protect, deleteMyAccount);

// Test protected route
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

// Test role-restricted route
router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.json({ message: 'Welcome, admin!' });
});

module.exports = router;