import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes';
import packageRoutes from './routes/packageRoutes';
import bookingRoutes from './routes/bookingRoutes';
import companyRoutes from './routes/companyRoutes';
import supportRoutes from './routes/supportRoutes';
import { errorHandler } from './middlewares/errorMiddleware';

const app = express();
const port = process.env.PORT || 3001;

// Security & Performance Middlewares
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/support', supportRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Wanderers API' });
});

// Global Error Handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Wanderers API server running at http://localhost:${port}`);
});
