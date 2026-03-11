import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['rent_due', 'payment_received', 'maintenance_update', 'general'],
    default: 'general'
  },
  channel: {
    type: String,
    enum: ['sms', 'email', 'in_app'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'read'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
