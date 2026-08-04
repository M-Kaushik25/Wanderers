import { Response } from 'express';
import prisma from '../models/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

/**
 * MOD-07 / SCR-08: Booking System Controller
 * Enforces all business rules from the approved specification:
 * - Past-Date Guard: travelDate must be >= today (midnight normalized)
 * - passengers >= 1 (minimum)
 * - totalAmount = price * passengers (auto-calculated server-side, not trusted from client)
 * - New bookings always start with status: PENDING
 * - Booking lifecycle: PENDING -> CONFIRMED -> COMPLETED | REJECTED | CANCELLED
 */

// ─────────────────────────────────────────────
// POST /api/bookings  (TOURIST role required)
// ─────────────────────────────────────────────
export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { packageId, travelDate, passengers } = req.body;

    // 1. Required field validation
    if (!packageId) {
      return res.status(400).json({ error: 'Package ID is required.' });
    }
    if (!travelDate) {
      return res.status(400).json({ error: 'A travel date is required.' });
    }

    // 2. Passenger count must be at least 1
    const numPassengers = Number(passengers);
    if (!numPassengers || numPassengers < 1) {
      return res.status(400).json({ error: 'Number of travelers must be at least 1.' });
    }

    // 3. Past-Date Guard — travelDate >= today (midnight, local-agnostic)
    const selectedDate = new Date(travelDate);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid travel date format. Use YYYY-MM-DD.' });
    }
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    if (selectedDate < todayMidnight) {
      return res.status(400).json({
        error: 'Travel date must be today or in the future. Past dates are not permitted.'
      });
    }

    // 4. Package existence check
    const pkg = await prisma.package.findUnique({
      where: { id: Number(packageId) },
      include: {
        company: { select: { id: true, name: true, isVerified: true } }
      }
    });
    if (!pkg) {
      return res.status(404).json({ error: 'Tour package not found.' });
    }

    // 5. Server-side total amount calculation — never trust client-supplied amount
    const totalAmount = Number((pkg.price * numPassengers).toFixed(2));

    // 6. Create booking record with PENDING status
    const booking = await prisma.booking.create({
      data: {
        touristId: req.user.id,
        packageId: Number(packageId),
        travelDate: selectedDate,
        passengers: numPassengers,
        totalAmount,
        status: 'PENDING'
      },
      include: {
        package: {
          include: { company: { select: { id: true, name: true, isVerified: true } } }
        },
        tourist: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });

    // 201 Created with full booking object
    return res.status(201).json(booking);
  } catch (error) {
    console.error('[BookingController] createBooking error:', error);
    return res.status(500).json({ error: 'Failed to process booking reservation. Please try again.' });
  }
};

// ─────────────────────────────────────────────
// GET /api/bookings/me  (TOURIST — own bookings history)
// ─────────────────────────────────────────────
export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { touristId: req.user.id },
      include: {
        package: {
          include: {
            company: { select: { id: true, name: true, isVerified: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(bookings);
  } catch (error) {
    console.error('[BookingController] getMyBookings error:', error);
    return res.status(500).json({ error: 'Failed to retrieve your booking history.' });
  }
};

// ─────────────────────────────────────────────
// GET /api/bookings/:id  (Travel Voucher by ID — Tourist/Operator/Admin)
// ─────────────────────────────────────────────
export const getBookingById = async (req: AuthRequest, res: Response) => {
  try {
    const bookingId = Number(req.params.id);
    if (isNaN(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID.' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        package: {
          include: {
            company: { select: { id: true, name: true, isVerified: true } }
          }
        },
        tourist: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking voucher not found.' });
    }

    // Access control: tourist owner | operator of the package | admin
    const isTouristOwner = booking.touristId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    let isOperatorOfPackage = false;
    if (req.user.role === 'OPERATOR') {
      const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
      if (company && booking.package.companyId === company.id) {
        isOperatorOfPackage = true;
      }
    }

    if (!isTouristOwner && !isOperatorOfPackage && !isAdmin) {
      return res.status(403).json({ error: 'You do not have permission to view this travel voucher.' });
    }

    return res.json(booking);
  } catch (error) {
    console.error('[BookingController] getBookingById error:', error);
    return res.status(500).json({ error: 'Failed to retrieve booking voucher.' });
  }
};

// ─────────────────────────────────────────────
// GET /api/bookings/company  (OPERATOR — incoming bookings for their packages)
// ─────────────────────────────────────────────
export const getCompanyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
    if (!company) {
      return res.status(403).json({ error: 'No tour company profile found for this operator account.' });
    }

    const bookings = await prisma.booking.findMany({
      where: { package: { companyId: company.id } },
      include: {
        tourist: { select: { id: true, name: true, email: true, phone: true } },
        package: { select: { id: true, title: true, destination: true, price: true, durationDays: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(bookings);
  } catch (error) {
    console.error('[BookingController] getCompanyBookings error:', error);
    return res.status(500).json({ error: 'Failed to retrieve company booking roster.' });
  }
};

// ─────────────────────────────────────────────
// PATCH /api/bookings/:id/status  (OPERATOR/ADMIN — lifecycle transitions)
// Lifecycle: PENDING -> CONFIRMED | REJECTED, CONFIRMED -> COMPLETED | CANCELLED
// ─────────────────────────────────────────────
export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const bookingId = Number(req.params.id);
    const { status } = req.body;

    if (isNaN(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID.' });
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}.`
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { package: true }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    // Operator role: can only update bookings for their own packages
    if (req.user.role !== 'ADMIN') {
      const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
      if (!company || booking.package.companyId !== company.id) {
        return res.status(403).json({ error: 'You can only manage bookings for your own tour packages.' });
      }
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        package: {
          include: { company: { select: { id: true, name: true } } }
        },
        tourist: { select: { id: true, name: true, email: true } }
      }
    });

    return res.json(updated);
  } catch (error) {
    console.error('[BookingController] updateBookingStatus error:', error);
    return res.status(500).json({ error: 'Failed to update booking status.' });
  }
};
