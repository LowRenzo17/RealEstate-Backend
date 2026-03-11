import MaintenanceRequest from "../models/MaintainanceRequest.js";

export const getMaintenanceRequests = async (req, res, next) => {
  try {
    const query = { organizationId: req.organizationId };
    if (req.query.unitId) query.unitId = req.query.unitId;
    if (req.query.tenantId) query.tenantId = req.query.tenantId;
    const requests = await MaintenanceRequest.find(query).populate('tenantId unitId');
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    next(err);
  }
};

export const createMaintenanceRequest = async (req, res, next) => {
  try {
    req.body.organizationId = req.organizationId;
    const request = await MaintenanceRequest.create(req.body);
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

export const updateMaintenanceStatus = async (req, res, next) => {
  try {
    const request = await MaintenanceRequest.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!request) return res.status(404).json({ success: false, message: 'Request not found or unauthorized' });
    res.status(200).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};
