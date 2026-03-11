import { jest } from '@jest/globals';

jest.unstable_mockModule('../../models/Payment.js', () => ({
    default: {
        find: jest.fn(),
        create: jest.fn(),
        findOne: jest.fn(),
    }
}));

jest.unstable_mockModule('../../models/Tenant.js', () => ({
    default: {
        findOne: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn()
    }
}));

jest.unstable_mockModule('../../models/Unit.js', () => ({
    default: {
        findById: jest.fn()
    }
}));

jest.unstable_mockModule('../../services/mpesaService.js', () => ({
    default: {
        stkPush: jest.fn()
    }
}));

jest.unstable_mockModule('../../services/receiptService.js', () => ({
    default: {
        generateReceipt: jest.fn()
    }
}));

const { getPayments, createPayment, getPayment, stkPush, mpesaCallback, getReceipt } = await import('../../controllers/paymentController.js');
const Payment = (await import('../../models/Payment.js')).default;
const Tenant = (await import('../../models/Tenant.js')).default;
const Unit = (await import('../../models/Unit.js')).default;
const mpesaService = (await import('../../services/mpesaService.js')).default;
const receiptService = (await import('../../services/receiptService.js')).default;

describe('Payment Controller Tests', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            organizationId: 'testOrgId',
            body: {},
            query: {},
            params: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            download: jest.fn()
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe('getPayments', () => {
        it('should get all payments scoped to organization', async () => {
            const mockPayments = [{ amount: 1000 }];
            const mockPopulate = jest.fn().mockResolvedValue(mockPayments);
            Payment.find.mockReturnValue({ populate: mockPopulate });

            await getPayments(mockReq, mockRes, mockNext);

            expect(Payment.find).toHaveBeenCalledWith({ organizationId: 'testOrgId' });
            expect(mockPopulate).toHaveBeenCalledWith('tenantId');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, count: 1, data: mockPayments });
        });
    });

    describe('createPayment', () => {
        it('should create payment scoped to organization', async () => {
            mockReq.body = { amount: 1000 };
            Payment.create.mockResolvedValue({ _id: 'paymentId', ...mockReq.body });

            await createPayment(mockReq, mockRes, mockNext);

            expect(Payment.create).toHaveBeenCalledWith({ amount: 1000, organizationId: 'testOrgId' });
            expect(mockRes.status).toHaveBeenCalledWith(201);
        });
    });

    describe('stkPush', () => {
        it('should return 404 if tenant not found or unauthorized', async () => {
            mockReq.body = { phoneNumber: '254700000000', amount: 1000, tenantId: 't1', unitId: 'u1' };
            Tenant.findOne.mockResolvedValue(null);

            await stkPush(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });

        it('should initiate mpesa push and create pending payment', async () => {
            mockReq.body = { phoneNumber: '254700000000', amount: 1000, tenantId: 't1', unitId: 'u1' };
            const mockTenant = { _id: 't1', name: 'John Doe', organizationId: 'testOrgId' };
            Tenant.findOne.mockResolvedValue(mockTenant);

            mpesaService.stkPush.mockResolvedValue({ CheckoutRequestID: 'ws_12345' });
            Payment.create.mockResolvedValue({});

            await stkPush(mockReq, mockRes, mockNext);

            expect(mpesaService.stkPush).toHaveBeenCalledWith('254700000000', 1000, 'Unit-u1', 'Rent Payment for John Doe');
            expect(Payment.create).toHaveBeenCalledWith(expect.objectContaining({
                status: 'pending',
                transactionId: 'ws_12345',
                organizationId: 'testOrgId'
            }));
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    describe('mpesaCallback', () => {
        it('should return 404 if payment record not found', async () => {
            mockReq.body = {
                Body: { stkCallback: { CheckoutRequestID: 'ws_12345', ResultCode: 0 } }
            };
            Payment.findOne.mockResolvedValue(null);

            await mpesaCallback(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(404);
        });

        it('should process successful callback and update rent status', async () => {
            mockReq.body = {
                Body: {
                    stkCallback: {
                        CheckoutRequestID: 'ws_123',
                        ResultCode: 0,
                        CallbackMetadata: {
                            Item: [
                                { Name: 'Amount', Value: 1000 },
                                { Name: 'MpesaReceiptNumber', Value: 'RECEIPT123' },
                                { Name: 'PhoneNumber', Value: 254700000000 }
                            ]
                        }
                    }
                }
            };

            const mockPayment = { tenantId: 't1', save: jest.fn().mockResolvedValue(true) };
            Payment.findOne.mockResolvedValue(mockPayment);
            Tenant.findByIdAndUpdate.mockResolvedValue(true);

            await mpesaCallback(mockReq, mockRes, mockNext);

            expect(mockPayment.status).toBe('paid');
            expect(mockPayment.mpesaReceipt).toBe('RECEIPT123');
            expect(mockPayment.save).toHaveBeenCalled();
            expect(Tenant.findByIdAndUpdate).toHaveBeenCalledWith('t1', { rentStatus: 'paid', daysLate: 0 });
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getReceipt', () => {
        it('should generate and download receipt', async () => {
            mockReq.params.id = 'p1';
            const mockPayment = { tenantId: 't1', unitId: 'u1' };

            Payment.findOne.mockResolvedValue(mockPayment);
            Tenant.findById.mockResolvedValue({ name: 'John Doe' });
            Unit.findById.mockResolvedValue({ unitNumber: '101' });
            receiptService.generateReceipt.mockResolvedValue({ filePath: '/downloads/receipt.pdf' });

            await getReceipt(mockReq, mockRes, mockNext);

            expect(receiptService.generateReceipt).toHaveBeenCalled();
            expect(mockRes.download).toHaveBeenCalledWith('/downloads/receipt.pdf');
        });
    });
});
