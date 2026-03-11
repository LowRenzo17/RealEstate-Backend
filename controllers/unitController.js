import Unit from '../models/Unit.js';
import Property from '../models/Property.js';

export const getUnits = async (req, res, next) => {
  try {
    const units = await Unit.find({
      propertyId: req.params.propertyId,
      organizationId: req.organizationId
    });
    res.status(200).json({ success: true, count: units.length, data: units });
  } catch (err) {
    next(err);
  }
};

export const createUnit = async (req, res, next) => {
  try {
    // Check if property belongs to organization
    const property = await Property.findOne({
      _id: req.body.propertyId,
      ownerId: req.user.id
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found or unauthorized' });
    }

    req.body.organizationId = req.organizationId;
    const unit = await Unit.create(req.body);

    // safe because property is already scoped to user
    await Property.findByIdAndUpdate(req.body.propertyId, { $inc: { numberOfUnits: 1 } });
    res.status(201).json({ success: true, data: unit });
  } catch (err) {
    next(err);
  }
};

export const updateUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!unit) return res.status(404).json({ success: false, message: 'Unit not found or unauthorized' });
    res.status(200).json({ success: true, data: unit });
  } catch (err) {
    next(err);
  }
};

export const deleteUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!unit) return res.status(404).json({ success: false, message: 'Unit not found or unauthorized' });

    await unit.deleteOne();
    await Property.findByIdAndUpdate(unit.propertyId, { $inc: { numberOfUnits: -1 } });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
