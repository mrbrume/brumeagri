const { body, validationResult } = require('express-validator');

// Runs after the specific rules below, collects any errors, and stops the request if invalid
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  handleValidation,
];

const validateLogin = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

const validateCrop = [
  body('name').trim().notEmpty().withMessage('Crop name is required'),
  body('plantingDate').isISO8601().withMessage('A valid planting date is required'),
  body('expectedHarvestDate').optional({ checkFalsy: true }).isISO8601().withMessage('Expected harvest date must be a valid date'),
  body('expectedYield').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Expected yield cannot be negative'),
  body('actualYield').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Actual yield cannot be negative'),
  handleValidation,
];

const validateInventory = [
  body('itemName').trim().notEmpty().withMessage('Item name is required'),
  body('category').isIn(['seeds', 'fertilizer', 'chemicals', 'equipment']).withMessage('Invalid category'),
  body('quantity').isFloat({ min: 0 }).withMessage('Quantity cannot be negative'),
  body('unitCost').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Unit cost cannot be negative'),
  body('minThreshold').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Minimum threshold cannot be negative'),
  handleValidation,
];

const validateSale = [
  body('product').trim().notEmpty().withMessage('Product is required'),
  body('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be greater than 0'),
  body('customer').trim().notEmpty().withMessage('Customer is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  handleValidation,
];

const validateExpense = [
  body('category').isIn(['fuel', 'labour', 'fertilizer', 'seeds', 'equipment', 'other']).withMessage('Invalid category'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  handleValidation,
];

const validateWorker = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('position').trim().notEmpty().withMessage('Position is required'),
  body('contact').optional({ checkFalsy: true }).isLength({ min: 7 }).withMessage('Contact must be a valid phone number or email'),
  handleValidation,
];

const validateFarm = [
  body('name').trim().notEmpty().withMessage('Farm name is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('size').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Size cannot be negative'),
  handleValidation,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCrop,
  validateInventory,
  validateSale,
  validateExpense,
  validateWorker,
  validateFarm,
};