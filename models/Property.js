import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  ownerId: {
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
  name: {
    type: String,
    required: [true, 'Please add a property name'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  city: {
    type: String,
    required: [true, 'Please add a city']
  },
  numberOfUnits: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Property = mongoose.model('Property', propertySchema);
export default Property;
