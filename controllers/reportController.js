import Payment from '../models/Payment.js';
import reportService from '../services/reportService.js';

export const getFinancialReport = async (req, res, next) => {
  try {
    const orgId = req.organizationId;
    const payments = await Payment.find({ organizationId: orgId }).populate('tenantId');

    const { filePath } = await reportService.generateFinancialReport(payments, orgId);

    res.download(filePath);
  } catch (err) {
    next(err);
  }
};

export const getPropertyReport = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    const payments = await Payment.find({ organizationId: req.organizationId }).populate({
      path: 'unitId',
      match: { propertyId: propertyId }
    }).populate('tenantId');

    // Filter payments that belong to the specified property
    const propertyPayments = payments.filter(payment => payment.unitId !== null);

    const { filePath } = await reportService.generateFinancialReport(propertyPayments, req.organizationId);

    res.download(filePath);
  } catch (err) {
    next(err);
  }
};
