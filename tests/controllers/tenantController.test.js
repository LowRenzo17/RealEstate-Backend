import { jest } from '@jest/globals';

jest.unstable_mockModule('../../models/Unit.js', () => ({
    default: {
        findOneAndUpdate: jest.fn()
    }
}));

jest.unstable_mockModule('../../models/Tenant.js', () => ({
    default: {
        find: jest.fn(),
        create: jest.fn(),
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn()
    }
}));

const { getTenants, createTenant, getTenant, updateTenant, deleteTenant } = await import('../../controllers/tenantController.js');
const Tenant = (await import('../../models/Tenant.js')).default;
const Unit = (await import('../../models/Unit.js')).default;

describe('Tenant Controller Tests', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            organizationId: 'testOrgId',
            body: {},
            params: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe('getTenants', () => {
        it('should get tenants scoped to organization', async () => {
            const mockTenants = [{ name: 'John Doe' }];
            const mockPopulate = jest.fn().mockResolvedValue(mockTenants);
            Tenant.find.mockReturnValue({ populate: mockPopulate });

            await getTenants(mockReq, mockRes, mockNext);

            expect(Tenant.find).toHaveBeenCalledWith({ organizationId: 'testOrgId' });
            expect(mockPopulate).toHaveBeenCalledWith('unitId');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, count: 1, data: mockTenants });
        });
    });

    describe('createTenant', () => {
        it('should create tenant and occupy unit', async () => {
            mockReq.body = { name: 'John Doe', unitId: 'unit123' };
            const createdTenant = { _id: 'tenantId', name: 'John Doe', organizationId: 'testOrgId' };

            Tenant.create.mockResolvedValue(createdTenant);
            Unit.findOneAndUpdate.mockResolvedValue({});

            await createTenant(mockReq, mockRes, mockNext);

            expect(Tenant.create).toHaveBeenCalledWith(expect.objectContaining({ organizationId: 'testOrgId' }));
            expect(Unit.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: 'unit123', organizationId: 'testOrgId' },
                { status: 'occupied' }
            );
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: createdTenant });
        });
    });

    describe('updateTenant', () => {
        it('should return 404 if tenant not found or unauthorized', async () => {
            mockReq.params.id = 'tenantId';
            mockReq.body = { email: 'new@email.com' };
            Tenant.findOneAndUpdate.mockResolvedValue(null);

            await updateTenant(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });

        it('should update tenant successfully', async () => {
            mockReq.params.id = 'tenantId';
            mockReq.body = { email: 'new@email.com' };
            Tenant.findOneAndUpdate.mockResolvedValue({ _id: 'tenantId', email: 'new@email.com' });

            await updateTenant(mockReq, mockRes, mockNext);

            expect(Tenant.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: 'tenantId', organizationId: 'testOrgId' },
                mockReq.body,
                expect.any(Object)
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    describe('deleteTenant', () => {
        it('should delete tenant and vacate unit', async () => {
            mockReq.params.id = 'tenantId';
            const mockTenant = {
                _id: 'tenantId',
                unitId: 'unit123',
                deleteOne: jest.fn().mockResolvedValue(true)
            };
            Tenant.findOne.mockResolvedValue(mockTenant);
            Unit.findOneAndUpdate.mockResolvedValue(true);

            await deleteTenant(mockReq, mockRes, mockNext);

            expect(Tenant.findOne).toHaveBeenCalledWith({ _id: 'tenantId', organizationId: 'testOrgId' });
            expect(mockTenant.deleteOne).toHaveBeenCalled();
            expect(Unit.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: 'unit123', organizationId: 'testOrgId' },
                { status: 'vacant' }
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });
});
