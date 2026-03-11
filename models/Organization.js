import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscriptionPlan: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    default: 'basic'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;
