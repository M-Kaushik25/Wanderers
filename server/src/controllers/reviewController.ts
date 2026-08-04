import { Response } from 'express';
import prisma from '../models/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

// Create a review for a package (only verified buyers with COMPLETED bookings)
export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { packageId, rating, comment } = req.body;

    if (!packageId || !rating) {
      return res.status(400).json({ error: 'Package ID and rating (1-5) are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5 stars' });
    }

    // Verify tourist has a COMPLETED booking for this package
    const completedBooking = await prisma.booking.findFirst({
      where: {
        touristId: req.user.id,
        packageId: Number(packageId),
        status: 'COMPLETED'
      }
    });

    if (!completedBooking) {
      return res.status(403).json({
        error: 'Only tourists with completed bookings can review this tour package.'
      });
    }

    const review = await prisma.review.create({
      data: {
        touristId: req.user.id,
        packageId: Number(packageId),
        rating: Number(rating),
        comment: comment || ''
      }
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
};

// Get reviews for a package
export const getPackageReviews = async (req: any, res: Response) => {
  try {
    const { packageId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { packageId: Number(packageId) },
      include: {
        tourist: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};
