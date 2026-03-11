import mongoose from 'mongoose';

const maintenanceRequestSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
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
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
export default MaintenanceRequest;
