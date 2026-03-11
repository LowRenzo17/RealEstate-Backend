import express from 'express';
import { 
  getOccupancyAnalytics, 
  getRevenueAnalytics, 
  getLatePayments 
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { restrictToOrganization } from '../middleware/tenantMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictToOrganization);
router.use(authorize('landlord', 'manager'));

router.get('/occupancy', getOccupancyAnalytics);
router.get('/revenue', getRevenueAnalytics);
router.get('/late-payments', getLatePayments);

export default router;
