import express from 'express';
import { 
  getFinancialReport, 
  getPropertyReport 
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { restrictToOrganization } from '../middleware/tenantMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictToOrganization);
router.use(authorize('landlord', 'manager'));

router.get('/monthly', getFinancialReport);
router.get('/property/:id', getPropertyReport);

export default router;
