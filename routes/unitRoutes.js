import express from 'express';
import { 
  getUnits, 
  createUnit, 
  updateUnit, 
  deleteUnit 
} from '../controllers/unitController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route('/')
  .get(getUnits)
  .post(authorize('landlord', 'manager'), createUnit);

router.route('/:id')
  .put(authorize('landlord', 'manager'), updateUnit)
  .delete(authorize('landlord', 'manager'), deleteUnit);

export default router;
