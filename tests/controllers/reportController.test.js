import { jest } from '@jest/globals';

jest.unstable_mockModule('../../models/Payment.js', () => ({
    default: {
        find: jest.fn()
    }
}));

jest.unstable_mockModule('../../services/reportService.js', () => ({
    default: {
        generateFinancialReport: jest.fn()
    }
}));

const { getFinancialReport, getPropertyReport } = await import('../../controllers/reportController.js');
const Payment = (await import('../../models/Payment.js')).default;
const reportService = (await import('../../services/reportService.js')).default;

describe('Report Controller Tests', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            organizationId: 'testOrgId',
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

    describe('getFinancialReport', () => {
        it('should generate and download the financial report', async () => {
            const mockPayments = [{ amount: 1000 }];
            const mockPopulate = jest.fn().mockResolvedValue(mockPayments);
            Payment.find.mockReturnValue({ populate: mockPopulate });

            reportService.generateFinancialReport.mockResolvedValue({ filePath: '/tmp/report.pdf' });

            await getFinancialReport(mockReq, mockRes, mockNext);

            expect(Payment.find).toHaveBeenCalledWith({ organizationId: 'testOrgId' });
            expect(mockPopulate).toHaveBeenCalledWith('tenantId');
            expect(reportService.generateFinancialReport).toHaveBeenCalledWith(mockPayments, 'testOrgId');
            expect(mockRes.download).toHaveBeenCalledWith('/tmp/report.pdf');
        });
    });

    describe('getPropertyReport', () => {
        it('should generate and download report specific to a property', async () => {
            mockReq.params.id = 'propId';
            const mockPayments = [
                { amount: 1000, unitId: 'unit1' },
                { amount: 2000, unitId: null } // Simulating filtered out mismatched property
            ];

            // Nested populate mock chain
            const mockPopulateTenantId = jest.fn().mockResolvedValue(mockPayments);
            const mockPopulateUnitId = jest.fn().mockReturnValue({ populate: mockPopulateTenantId });
            Payment.find.mockReturnValue({ populate: mockPopulateUnitId });

            reportService.generateFinancialReport.mockResolvedValue({ filePath: '/tmp/prop-report.pdf' });

            await getPropertyReport(mockReq, mockRes, mockNext);

            expect(Payment.find).toHaveBeenCalledWith({ organizationId: 'testOrgId' });
            expect(mockPopulateUnitId).toHaveBeenCalledWith({
                path: 'unitId',
                match: { propertyId: 'propId' }
            });
            // Should pass only filtered payments where unitId is not null
            expect(reportService.generateFinancialReport).toHaveBeenCalledWith(
                [{ amount: 1000, unitId: 'unit1' }],
                'testOrgId'
            );
            expect(mockRes.download).toHaveBeenCalledWith('/tmp/prop-report.pdf');
        });
    });
});
