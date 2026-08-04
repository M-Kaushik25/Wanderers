import { Response } from 'express';
import prisma from '../models/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

// Create a booking (MOD-07 / SCR-08 Specification)
export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { packageId, travelDate, passengers } = req.body;

    if (!packageId) {
      return res.status(400).json({ error: 'Package ID is required' });
    }

    const numPassengers = Number(passengers) || 1;
    if (numPassengers < 1) {
      return res.status(400).json({ error: 'Passenger count must be at least 1' });
    }

    // Past-Date Guard: travelDate >= Today
    const selectedDate = new Date(travelDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime()) || selectedDate < today) {
      return res.status(400).json({
        error: 'Selected travel date must be today or in the future.'
      });
    }

    const pkg = await prisma.package.findUnique({
      where: { id: Number(packageId) },
      include: { company: true }
    });

    if (!pkg) {
      return res.status(404).json({ error: 'Tour package not found' });
    }

    const totalAmount = pkg.price * numPassengers;

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
          include: { company: true }
        },
        tourist: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to process booking reservation' });
  }
};

// Get tourist's own booking history (TOURIST)
export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { touristId: req.user.id },
      include: {
        package: {
          include: { company: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer bookings' });
  }
};

// Get single booking voucher pass by ID
export const getBookingById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      include: {
        package: {
          include: { company: true }
        },
        tourist: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking record not found' });
    }

    // Access check: Tourist owner, Operator owner, or Admin
    const isTouristOwner = booking.touristId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    let isOperatorOwner = false;

    if (req.user.role === 'OPERATOR') {
      const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
      if (company && booking.package.companyId === company.id) {
        isOperatorOwner = true;
      }
    }

    if (!isTouristOwner && !isOperatorOwner && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to view this travel voucher' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch voucher details' });
  }
};

// Get company's incoming customer bookings (OPERATOR)
export const getCompanyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
    if (!company) {
      return res.status(403).json({ error: 'No registered tour company profile found' });
    }

    const bookings = await prisma.booking.findMany({
      where: { package: { companyId: company.id } },
      include: {
        tourist: { select: { id: true, name: true, email: true, phone: true } },
        package: { select: { id: true, title: true, destination: true, price: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incoming operator bookings' });
  }
};

// Update booking status (OPERATOR / ADMIN)
export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid booking status code' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      include: { package: true }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (req.user.role !== 'ADMIN') {
      const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
      if (!company || booking.package.companyId !== company.id) {
        return res.status(403).json({ error: 'Unauthorized to update status for this booking' });
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: Number(id) },
      data: { status },
      include: {
        package: true,
        tourist: { select: { id: true, name: true, email: true } }
      }
    });

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking status' });
  }
};
