import { Router } from 'express';
import { createCompany, getMyCompany, getAllCompanies, verifyCompany } from '../controllers/companyController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, authorize(['ADMIN']), getAllCompanies as any);
router.post('/', authenticate, authorize(['OPERATOR']), createCompany as any);
router.get('/me', authenticate, authorize(['OPERATOR']), getMyCompany as any);
router.patch('/:id/verify', authenticate, authorize(['ADMIN']), verifyCompany as any);

export default router;
