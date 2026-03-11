import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
    index: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  unitNumber: {
    type: String,
    required: [true, 'Please add a unit number']
  },
  rentAmount: {
    type: Number,
    required: [true, 'Please add rent amount']
  },
  status: {
    type: String,
    enum: ['occupied', 'vacant'],
    default: 'vacant'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Unit = mongoose.model('Unit', unitSchema);
export default Unit;
