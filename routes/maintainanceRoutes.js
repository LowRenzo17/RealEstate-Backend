import express from 'express';
import { 
  getMaintenanceRequests, 
  createMaintenanceRequest, 
  updateMaintenanceStatus 
} from '../controllers/maintananceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMaintenanceRequests)
  .post(createMaintenanceRequest);

router.route('/:id')
  .patch(authorize('landlord', 'manager'), updateMaintenanceStatus);

export default router;
