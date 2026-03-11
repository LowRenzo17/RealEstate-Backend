import Tenant from '../models/Tenant.js';
import Payment from '../models/Payment.js';
import MaintenanceRequest from '../models/MaintenanceRequest.js';
import Unit from '../models/Unit.js';

export const getTenantDashboard = async (req, res, next) => {
  try {
    const tenant = await Tenant.findOne({ userId: req.user.id }).populate('unitId');
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    const recentPayments = await Payment.find({ tenantId: tenant._id })
      .sort({ paymentDate: -1 })
      .limit(5);

    const activeMaintenance = await MaintenanceRequest.find({
      tenantId: tenant._id,
      status: { $ne: 'resolved' }
    });

    res.status(200).json({
      success: true,
      data: {
        tenant,
        recentPayments,
        activeMaintenance,
        rentBalance: tenant.rentStatus === 'paid' ? 0 : tenant.unitId.rentAmount
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getTenantPayments = async (req, res, next) => {
  try {
    const tenant = await Tenant.findOne({ userId: req.user.id });
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    const payments = await Payment.find({ tenantId: tenant._id }).sort({ paymentDate: -1 });
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    next(err);
  }
};

export const tenantSubmitMaintenance = async (req, res, next) => {
  try {
    const tenant = await Tenant.findOne({ userId: req.user.id });
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    const request = await MaintenanceRequest.create({
      ...req.body,
      tenantId: tenant._id,
      unitId: tenant.unitId,
      organizationId: tenant.organizationId
    });

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};
