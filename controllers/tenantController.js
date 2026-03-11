import Tenant from '../models/Tenant.js';
import Unit from '../models/Unit.js';

export const getTenants = async (req, res, next) => {
  try {
    const tenants = await Tenant.find({ organizationId: req.organizationId }).populate('unitId');
    res.status(200).json({ success: true, count: tenants.length, data: tenants });
  } catch (err) {
    next(err);
  }
};

export const createTenant = async (req, res, next) => {
  try {
    req.body.organizationId = req.organizationId;
    const tenant = await Tenant.create(req.body);
    await Unit.findOneAndUpdate(
      { _id: req.body.unitId, organizationId: req.organizationId },
      { status: 'occupied' }
    );
    res.status(201).json({ success: true, data: tenant });
  } catch (err) {
    next(err);
  }
};

export const getTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findOne({ _id: req.params.id, organizationId: req.organizationId }).populate('unitId');
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found or unauthorized' });
    res.status(200).json({ success: true, data: tenant });
  } catch (err) {
    next(err);
  }
};

export const updateTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found or unauthorized' });
    res.status(200).json({ success: true, data: tenant });
  } catch (err) {
    next(err);
  }
};

export const deleteTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found or unauthorized' });

    // Only vacate the unit if the tenant is actually deleted to prevent race conditions
    await tenant.deleteOne();
    await Unit.findOneAndUpdate(
      { _id: tenant.unitId, organizationId: req.organizationId },
      { status: 'vacant' }
    );
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
