import express from 'express';
import { 
  getTenantDashboard, 
  getTenantPayments, 
  tenantSubmitMaintenance 
} from '../controllers/tenantPortalController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('tenant'));

router.get('/dashboard', getTenantDashboard);
router.get('/payments', getTenantPayments);
router.post('/maintenance', tenantSubmitMaintenance);

export default router;
