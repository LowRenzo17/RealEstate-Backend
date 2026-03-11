import express from 'express';
import { 
  getTenants, 
  createTenant, 
  getTenant, 
  updateTenant, 
  deleteTenant 
} from '../controllers/tenantController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTenants)
  .post(authorize('landlord', 'manager'), createTenant);

router.route('/:id')
  .get(getTenant)
  .put(authorize('landlord', 'manager'), updateTenant)
  .delete(authorize('landlord', 'manager'), deleteTenant);

export default router;
