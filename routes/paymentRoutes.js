import express from 'express';
import {
  getPayments,
  createPayment,
  getPayment,
  stkPush,
  mpesaCallback,
  getReceipt
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPayments)
  .post(authorize('landlord', 'manager'), createPayment);

router.route('/:id')
  .get(getPayment);

router.post('/mpesa/stk-push', stkPush);
router.post('/mpesa/callback', mpesaCallback);
router.get('/:id/receipt', getReceipt);

export default router;
