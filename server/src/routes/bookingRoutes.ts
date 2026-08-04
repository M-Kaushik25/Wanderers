import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  getCompanyBookings,
  updateBookingStatus
} from '../controllers/bookingController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

/**
 * MOD-07 Booking System API Routes
 * Access Matrix per Phase 8 of UX specification:
 *   TOURIST   — Create bookings, view own history, view own vouchers
 *   OPERATOR  — View company bookings, update booking status
 *   ADMIN     — View any booking, override any status
 */
const router = Router();

// Tourist: Create a new booking reservation
router.post(
  '/',
  authenticate,
  authorize(['TOURIST', 'OPERATOR', 'ADMIN']),
  createBooking as any
);

// Tourist: Get own booking history (My Bookings page - SCR-05)
router.get(
  '/me',
  authenticate,
  authorize(['TOURIST']),
  getMyBookings as any
);

// Operator: Get all bookings for own company packages (SCR-06)
router.get(
  '/company',
  authenticate,
  authorize(['OPERATOR']),
  getCompanyBookings as any
);

// Shared: Get single booking voucher by ID (SCR-05 Travel Pass)
router.get(
  '/:id',
  authenticate,
  getBookingById as any
);

// Operator/Admin: Update booking lifecycle status
router.patch(
  '/:id/status',
  authenticate,
  authorize(['OPERATOR', 'ADMIN']),
  updateBookingStatus as any
);

export default router;
