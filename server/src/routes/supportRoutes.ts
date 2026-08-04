import { Router } from 'express';
import { createSupportTicket, getMyTickets, getAllTickets } from '../controllers/supportController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticate, createSupportTicket as any);
router.get('/me', authenticate, getMyTickets as any);
router.get('/', authenticate, authorize(['ADMIN']), getAllTickets as any);

export default router;
