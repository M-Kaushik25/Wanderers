const { body } = require('express-validator');

const bookingValidationRules = [
  body('name').trim().notEmpty().withMessage('Name is required').escape(),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone number is required')
    .isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10 and 15 characters'),
  body('package_id').isInt({ gt: 0 }).withMessage('Valid package ID is required'),
  body('travel_date').isISO8601().withMessage('Valid travel date is required')
    .custom((value) => {
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Strip time for accurate date comparison
      if (inputDate < today) {
        throw new Error('Travel date cannot be in the past');
      }
      return true;
    }),
  body('passengers').isInt({ min: 1, max: 20 }).withMessage('Number of travelers must be between 1 and 20')
];

module.exports = { bookingValidationRules };
