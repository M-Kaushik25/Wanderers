import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  getCompanyBookings,
  updateBookingStatus
} from '../controllers/bookingController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Booking Routes
router.post('/', authenticate, authorize(['TOURIST', 'OPERATOR', 'ADMIN']), createBooking as any);
router.get('/me', authenticate, authorize(['TOURIST']), getMyBookings as any);
router.get('/company', authenticate, authorize(['OPERATOR']), getCompanyBookings as any);
router.get('/:id', authenticate, getBookingById as any);
router.patch('/:id/status', authenticate, authorize(['OPERATOR', 'ADMIN']), updateBookingStatus as any);

export default router;
