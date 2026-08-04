import { Request, Response } from 'express';
import prisma from '../models/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

// Create a booking (TOURIST)
export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { packageId, travelDate, passengers } = req.body;

    const selectedDate = new Date(travelDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime()) || selectedDate < today) {
      return res.status(400).json({ error: 'Travel date must be today or in the future' });
    }

    const pkg = await prisma.package.findUnique({ where: { id: Number(packageId) } });
    if (!pkg) return res.status(404).json({ error: 'Package not found' });

    const totalAmount = pkg.price * (passengers || 1);

    const booking = await prisma.booking.create({
      data: {
        touristId: req.user.id,
        packageId: Number(packageId),
        travelDate: new Date(travelDate),
        passengers,
        totalAmount,
        status: 'PENDING'
      }
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

// Get tourist bookings (TOURIST)
export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { touristId: req.user.id },
      include: {
        package: true
      }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Get company bookings (OPERATOR)
export const getCompanyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
    if (!company) return res.status(403).json({ error: 'No company profile found' });

    const bookings = await prisma.booking.findMany({
      where: { package: { companyId: company.id } },
      include: {
        tourist: { select: { name: true, email: true } },
        package: { select: { title: true } }
      }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Update booking status (OPERATOR)
export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
    if (!company) return res.status(403).json({ error: 'No company profile found' });

    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      include: { package: true }
    });

    if (!booking || booking.package.companyId !== company.id) {
      return res.status(403).json({ error: 'Unauthorized to update this booking' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: Number(id) },
      data: { status }
    });

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking status' });
  }
};
