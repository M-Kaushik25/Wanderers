const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { validationResult } = require('express-validator');
const { bookingValidationRules } = require('../middleware/validators');

// API: Create a booking
router.post('/', bookingValidationRules, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
  }

  const { name, email, phone, package_id, travel_date, passengers } = req.body;
  
  db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return next(err);
    if (user) {
      insertBooking(user.id, package_id, travel_date, passengers, res, next);
    } else {
      db.run('INSERT INTO users (name, email, phone) VALUES (?, ?, ?)', [name, email, phone], function(err) {
        if (err) return next(err);
        insertBooking(this.lastID, package_id, travel_date, passengers, res, next);
      });
    }
  });
});

function insertBooking(user_id, package_id, travel_date, passengers, res, next) {
  db.run('INSERT INTO bookings (user_id, package_id, travel_date, passengers) VALUES (?, ?, ?, ?)', 
    [user_id, package_id, travel_date, passengers], 
    function(err) {
      if (err) return next(err);
      res.json({ message: 'Booking successful', booking_id: this.lastID });
    }
  );
}

module.exports = router;
