import { jest } from '@jest/globals';

// A mock maintenance model
jest.unstable_mockModule('../../models/MaintainanceRequest.js', () => ({
    default: {
        find: jest.fn(),
        create: jest.fn(),
        findOneAndUpdate: jest.fn()
    }
}));

const { getMaintenanceRequests, createMaintenanceRequest, updateMaintenanceStatus } = await import('../../controllers/maintananceController.js');
const MaintenanceRequest = (await import('../../models/MaintainanceRequest.js')).default;

describe('Maintenance Controller Tests', () => {
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
            json: jest.fn()
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe('getMaintenanceRequests', () => {
        it('should get all maintenance requests scoped to organization', async () => {
            const mockRequests = [{ title: 'Fix sink' }];
            const mockPopulate = jest.fn().mockResolvedValue(mockRequests);
            MaintenanceRequest.find.mockReturnValue({ populate: mockPopulate });

            await getMaintenanceRequests(mockReq, mockRes, mockNext);

            expect(MaintenanceRequest.find).toHaveBeenCalledWith({ organizationId: 'testOrgId' });
            expect(mockPopulate).toHaveBeenCalledWith('tenantId unitId');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, count: 1, data: mockRequests });
        });

        it('should filter by unitId and tenantId if provided', async () => {
            mockReq.query = { unitId: 'u1', tenantId: 't1' };
            const mockPopulate = jest.fn().mockResolvedValue([]);
            MaintenanceRequest.find.mockReturnValue({ populate: mockPopulate });

            await getMaintenanceRequests(mockReq, mockRes, mockNext);

            expect(MaintenanceRequest.find).toHaveBeenCalledWith({
                organizationId: 'testOrgId',
                unitId: 'u1',
                tenantId: 't1'
            });
        });
    });

    describe('createMaintenanceRequest', () => {
        it('should create a maintenance request contextually tied to organization', async () => {
            mockReq.body = { issue: 'Leaking pipe' };
            MaintenanceRequest.create.mockResolvedValue({ _id: 'm1', ...mockReq.body });

            await createMaintenanceRequest(mockReq, mockRes, mockNext);

            expect(MaintenanceRequest.create).toHaveBeenCalledWith({
                issue: 'Leaking pipe',
                organizationId: 'testOrgId'
            });
            expect(mockRes.status).toHaveBeenCalledWith(201);
        });
    });

    describe('updateMaintenanceStatus', () => {
        it('should return 404 if unauthorized or not found', async () => {
            mockReq.params.id = 'm1';
            mockReq.body.status = 'resolved';
            MaintenanceRequest.findOneAndUpdate.mockResolvedValue(null);

            await updateMaintenanceStatus(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(404);
        });

        it('should update maintenance status successfully', async () => {
            mockReq.params.id = 'm1';
            mockReq.body.status = 'resolved';
            MaintenanceRequest.findOneAndUpdate.mockResolvedValue({ _id: 'm1', status: 'resolved' });

            await updateMaintenanceStatus(mockReq, mockRes, mockNext);

            expect(MaintenanceRequest.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: 'm1', organizationId: 'testOrgId' },
                { status: 'resolved' },
                expect.any(Object)
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });
});
