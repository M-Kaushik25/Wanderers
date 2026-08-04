require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3000;

// Global Security & Performance Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.tailwindcss.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
    },
  },
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', globalLimiter);

// Routers
const packagesRouter = require('./routes/packages');
const bookingsRouter = require('./routes/bookings');
const adminRouter = require('./routes/admin');

app.use('/api/packages', packagesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/admin', adminRouter);

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Error]:', err.stack);
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(500).json({ 
    error: isProduction ? 'Internal Server Error' : err.message 
  });
});

app.listen(port, () => {
  console.log(`Wanderers server running at http://localhost:${port}`);
});
