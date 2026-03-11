import { jest } from '@jest/globals';

jest.unstable_mockModule('../../models/Organization.js', () => ({
    default: {
        create: jest.fn(),
        findById: jest.fn()
    }
}));

jest.unstable_mockModule('../../models/User.js', () => ({
    default: {
        findByIdAndUpdate: jest.fn()
    }
}));

const { createOrganization, getOrganization } = await import('../../controllers/organizationController.js');
const Organization = (await import('../../models/Organization.js')).default;
const User = (await import('../../models/User.js')).default;

describe('Organization Controller Tests', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            user: { id: 'userId' },
            organizationId: 'orgId',
            body: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe('createOrganization', () => {
        it('should create an organization and link it to the user', async () => {
            mockReq.body = { name: 'My Org', subscriptionPlan: 'premium' };
            const mockOrg = { _id: 'newOrgId', name: 'My Org' };
            Organization.create.mockResolvedValue(mockOrg);
            User.findByIdAndUpdate.mockResolvedValue(true);

            await createOrganization(mockReq, mockRes, mockNext);

            expect(Organization.create).toHaveBeenCalledWith({
                name: 'My Org',
                ownerId: 'userId',
                subscriptionPlan: 'premium'
            });
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith('userId', { organizationId: 'newOrgId' });
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockOrg });
        });
    });

    describe('getOrganization', () => {
        it('should return 404 if organization not found', async () => {
            Organization.findById.mockResolvedValue(null);
            await getOrganization(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(404);
        });

        it('should return organization data', async () => {
            const mockOrg = { _id: 'orgId', name: 'My Org' };
            Organization.findById.mockResolvedValue(mockOrg);

            await getOrganization(mockReq, mockRes, mockNext);

            expect(Organization.findById).toHaveBeenCalledWith('orgId');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockOrg });
        });
    });
});
