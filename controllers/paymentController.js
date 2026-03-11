import Payment from '../models/Payment.js';
import Tenant from '../models/Tenant.js';
import Unit from '../models/Unit.js';
import mpesaService from '../services/mpesaService.js';
import receiptService from '../services/receiptService.js';

export const getPayments = async (req, res, next) => {
  try {
    const query = { organizationId: req.organizationId };
    if (req.query.tenantId) query.tenantId = req.query.tenantId;
    const payments = await Payment.find(query).populate('tenantId');
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    next(err);
  }
};

export const createPayment = async (req, res, next) => {
  try {
    req.body.organizationId = req.organizationId;
    const payment = await Payment.create(req.body);
    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

export const getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, organizationId: req.organizationId }).populate('tenantId');
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found or unauthorized' });
    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

export const stkPush = async (req, res, next) => {
  try {
    const { phoneNumber, amount, tenantId, unitId } = req.body;

    // Ensure tenant exists and belongs to organization
    const tenant = await Tenant.findOne({ _id: tenantId, organizationId: req.organizationId });
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found or unauthorized' });

    const response = await mpesaService.stkPush(
      phoneNumber,
      amount,
      `Unit-${unitId}`,
      `Rent Payment for ${tenant.name}`
    );

    // Create a pending payment record
    await Payment.create({
      tenantId,
      unitId,
      organizationId: tenant.organizationId,
      amount,
      paymentMethod: 'mpesa',
      status: 'pending',
      paymentStatus: 'pending',
      phoneNumber,
      transactionId: response.CheckoutRequestID // Temporary ID to match callback
    });

    res.status(200).json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
};

export const mpesaCallback = async (req, res, next) => {
  try {
    const { Body } = req.body;
    const checkoutRequestID = Body.stkCallback.CheckoutRequestID;
    const resultCode = Body.stkCallback.ResultCode;

    const payment = await Payment.findOne({ transactionId: checkoutRequestID });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

    if (resultCode === 0) {
      const callbackMetadata = Body.stkCallback.CallbackMetadata.Item;
      const amount = callbackMetadata.find(item => item.Name === 'Amount').Value;
      const mpesaReceipt = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber').Value;
      const phoneNumber = callbackMetadata.find(item => item.Name === 'PhoneNumber').Value;

      payment.status = 'paid';
      payment.paymentStatus = 'completed';
      payment.mpesaReceipt = mpesaReceipt;
      payment.phoneNumber = phoneNumber.toString();
      payment.amount = amount;
      await payment.save();

      // Update tenant rent status
      await Tenant.findByIdAndUpdate(payment.tenantId, { rentStatus: 'paid', daysLate: 0 });
    } else {
      payment.status = 'failed';
      payment.paymentStatus = 'failed';
      await payment.save();
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('M-Pesa Callback Error:', err);
    res.status(500).json({ success: false });
  }
};

export const getReceipt = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found or unauthorized' });

    const tenant = await Tenant.findById(payment.tenantId);
    const unit = await Unit.findById(payment.unitId);

    const { filePath } = await receiptService.generateReceipt(payment, tenant, unit);

    res.download(filePath);
  } catch (err) {
    next(err);
  }
};
