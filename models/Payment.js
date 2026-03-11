import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add payment amount']
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank', 'mobile', 'mpesa'],
    required: true
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'failed'],
    default: 'paid'
  },
  mpesaReceipt: String,
  transactionId: String,
  phoneNumber: String,
  paymentStatus: {
    type: String,
    enum: ['completed', 'pending', 'failed'],
    default: 'completed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
