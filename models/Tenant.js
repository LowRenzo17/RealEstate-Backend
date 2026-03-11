import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a tenant name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  rentDueDay: {
    type: Number,
    default: 1
  },
  rentStatus: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending'
  },
  daysLate: {
    type: Number,
    default: 0
  },
  leaseStart: {
    type: Date,
    required: true
  },
  leaseEnd: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Tenant = mongoose.model('Tenant', tenantSchema);
export default Tenant;
