import { Router } from 'express';
import { getPackages, getPackageById, createPackage, updatePackage, deletePackage } from '../controllers/packageController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', getPackages);
router.get('/:id', getPackageById);

router.post('/', authenticate, authorize(['OPERATOR', 'ADMIN']), createPackage as any);
router.put('/:id', authenticate, authorize(['OPERATOR', 'ADMIN']), updatePackage as any);
router.delete('/:id', authenticate, authorize(['OPERATOR', 'ADMIN']), deletePackage as any);

export default router;
