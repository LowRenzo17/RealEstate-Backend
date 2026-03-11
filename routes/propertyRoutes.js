import express from 'express';
import { 
  getProperties, 
  createProperty, 
  getProperty, 
  updateProperty, 
  deleteProperty 
} from '../controllers/propertyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProperties)
  .post(authorize('landlord', 'manager'), createProperty);

router.route('/:id')
  .get(getProperty)
  .put(authorize('landlord', 'manager'), updateProperty)
  .delete(authorize('landlord'), deleteProperty);

export default router;
