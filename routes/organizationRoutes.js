import express from 'express';
import {
  createOrganization,
  getOrganization
} from '../controllers/organizationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('landlord'));

router.post('/create', createOrganization);
router.get('/', getOrganization);

export default router;
