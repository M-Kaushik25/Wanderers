import { Router } from 'express';
import { createReview, getPackageReviews } from '../controllers/reviewController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticate, createReview as any);
router.get('/package/:packageId', getPackageReviews as any);

export default router;
