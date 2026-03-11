import Property from '../models/Property.js';

export const getProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ ownerId: req.user.id });
    res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (err) {
    next(err);
  }
};

export const createProperty = async (req, res, next) => {
  try {
    req.body.ownerId = req.user.id;
    const property = await Property.create(req.body);
    res.status(201).json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
};

export const getProperty = async (req, res, next) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, ownerId: req.user.id });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    res.status(200).json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
};

export const updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findOne({ _id: req.params.id, ownerId: req.user.id });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
};

export const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, ownerId: req.user.id });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    await property.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
