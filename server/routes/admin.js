const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { authenticateAdmin } = require('../middleware/auth');

// Strict Rate Limiter for Login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again later.' }
});

// Admin Login
router.post('/login', loginLimiter, (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  db.get('SELECT * FROM admins WHERE email = ?', [email], (err, admin) => {
    if (err) return next(err);
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const isValidPassword = bcrypt.compareSync(password, admin.password);
    if (!isValidPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '2h' });
    
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2 * 60 * 60 * 1000
    });

    res.json({ message: 'Login successful' });
  });
});

// Admin Logout
router.post('/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({ message: 'Logout successful' });
});

// Admin Change Password
router.post('/change-password', authenticateAdmin, (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Old and new passwords are required' });

  const adminId = req.admin.id;

  db.get('SELECT * FROM admins WHERE id = ?', [adminId], (err, admin) => {
    if (err || !admin) return next(err || new Error('Admin not found'));

    const isValidPassword = bcrypt.compareSync(oldPassword, admin.password);
    if (!isValidPassword) return res.status(401).json({ error: 'Invalid old password' });

    const saltRounds = 10;
    const hash = bcrypt.hashSync(newPassword, saltRounds);

    db.run('UPDATE admins SET password = ? WHERE id = ?', [hash, adminId], function(err) {
      if (err) return next(err);
      res.json({ message: 'Password updated successfully' });
    });
  });
});

/* --- BOOKINGS CRUD --- */
router.get('/bookings', authenticateAdmin, (req, res, next) => {
  const query = `
    SELECT bookings.id, bookings.booking_date, bookings.travel_date, bookings.passengers, bookings.status,
           users.name as user_name, users.email as user_email,
           packages.title as package_title, packages.price as package_price
    FROM bookings
    JOIN users ON bookings.user_id = users.id
    JOIN packages ON bookings.package_id = packages.id
    ORDER BY bookings.booking_date DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return next(err);
    res.json({ data: rows });
  });
});

router.put('/bookings/:id/status', authenticateAdmin, (req, res, next) => {
  const { status } = req.body;
  if (!['Pending', 'Approved', 'Rejected', 'Cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  db.run('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return next(err);
    if (this.changes === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking status updated' });
  });
});

router.delete('/bookings/:id', authenticateAdmin, (req, res, next) => {
  db.run('DELETE FROM bookings WHERE id = ?', [req.params.id], function(err) {
    if (err) return next(err);
    if (this.changes === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking deleted' });
  });
});

/* --- PACKAGES CRUD --- */
router.post('/packages', authenticateAdmin, (req, res, next) => {
  const { title, description, destination, duration_days, price, image_url } = req.body;
  const sql = 'INSERT INTO packages (title, description, destination, duration_days, price, image_url) VALUES (?, ?, ?, ?, ?, ?)';
  db.run(sql, [title, description, destination, duration_days, price, image_url], function(err) {
    if (err) return next(err);
    res.json({ message: 'Package created', id: this.lastID });
  });
});

router.put('/packages/:id', authenticateAdmin, (req, res, next) => {
  const { title, description, destination, duration_days, price, image_url } = req.body;
  const sql = 'UPDATE packages SET title=?, description=?, destination=?, duration_days=?, price=?, image_url=? WHERE id=?';
  db.run(sql, [title, description, destination, duration_days, price, image_url, req.params.id], function(err) {
    if (err) return next(err);
    if (this.changes === 0) return res.status(404).json({ error: 'Package not found' });
    res.json({ message: 'Package updated' });
  });
});

router.delete('/packages/:id', authenticateAdmin, (req, res, next) => {
  db.run('DELETE FROM packages WHERE id = ?', [req.params.id], function(err) {
    if (err) return next(err);
    if (this.changes === 0) return res.status(404).json({ error: 'Package not found' });
    res.json({ message: 'Package deleted' });
  });
});

module.exports = router;
