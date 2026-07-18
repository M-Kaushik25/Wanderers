const express = require('express');
const router = express.Router();
const db = require('../config/db');

// API: Get all packages
router.get('/', (req, res, next) => {
  db.all('SELECT * FROM packages', [], (err, rows) => {
    if (err) return next(err);
    res.json({ data: rows });
  });
});

// API: Get a single package
router.get('/:id', (req, res, next) => {
  db.get('SELECT * FROM packages WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return next(err);
    res.json({ data: row });
  });
});

module.exports = router;
