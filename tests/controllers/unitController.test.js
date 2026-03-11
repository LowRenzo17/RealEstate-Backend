import { jest } from '@jest/globals';

jest.unstable_mockModule('../../models/Unit.js', () => ({
    default: {
        find: jest.fn(),
        create: jest.fn(),
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn()
    }
}));

jest.unstable_mockModule('../../models/Property.js', () => ({
    default: {
        findOne: jest.fn(),
        findByIdAndUpdate: jest.fn()
    }
}));

const { getUnits, createUnit, updateUnit, deleteUnit } = await import('../../controllers/unitController.js');
const Unit = (await import('../../models/Unit.js')).default;
const Property = (await import('../../models/Property.js')).default;

describe('Unit Controller Tests', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            user: { id: 'testUserId' },
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

    describe('getUnits', () => {
        it('should get units for a property within the organization', async () => {
            mockReq.params.propertyId = 'propId';
            const mockUnits = [{ unitNumber: '101' }];
            Unit.find.mockResolvedValue(mockUnits);

            await getUnits(mockReq, mockRes, mockNext);

            expect(Unit.find).toHaveBeenCalledWith({
                propertyId: 'propId',
                organizationId: 'testOrgId'
            });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, count: 1, data: mockUnits });
        });
    });

    describe('createUnit', () => {
        it('should return 404 if property not found or unauthorized', async () => {
            mockReq.body.propertyId = 'propId';
            Property.findOne.mockResolvedValue(null);

            await createUnit(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringMatching(/unauthorized/i) }));
        });

        it('should create unit and increment property unit count', async () => {
            mockReq.body = { propertyId: 'propId', unitNumber: '102' };
            Property.findOne.mockResolvedValue({ _id: 'propId' });
            Unit.create.mockResolvedValue({ _id: 'unitId' });

            await createUnit(mockReq, mockRes, mockNext);

            expect(Unit.create).toHaveBeenCalledWith(expect.objectContaining({ organizationId: 'testOrgId' }));
            expect(Property.findByIdAndUpdate).toHaveBeenCalledWith('propId', { $inc: { numberOfUnits: 1 } });
            expect(mockRes.status).toHaveBeenCalledWith(201);
        });
    });

    describe('updateUnit', () => {
        it('should update unit if authorized via organizationId', async () => {
            mockReq.params.id = 'unitId';
            mockReq.body = { rentAmount: 1000 };
            Unit.findOneAndUpdate.mockResolvedValue({ _id: 'unitId', rentAmount: 1000 });

            await updateUnit(mockReq, mockRes, mockNext);

            expect(Unit.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: 'unitId', organizationId: 'testOrgId' },
                mockReq.body,
                expect.any(Object)
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 if unit not found for the organization', async () => {
            Unit.findOneAndUpdate.mockResolvedValue(null);
            await updateUnit(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteUnit', () => {
        it('should delete unit and decrement property unit count', async () => {
            mockReq.params.id = 'unitId';
            const mockUnit = {
                _id: 'unitId',
                propertyId: 'propId',
                deleteOne: jest.fn().mockResolvedValue(true)
            };
            Unit.findOne.mockResolvedValue(mockUnit);

            await deleteUnit(mockReq, mockRes, mockNext);

            expect(Unit.findOne).toHaveBeenCalledWith({ _id: 'unitId', organizationId: 'testOrgId' });
            expect(mockUnit.deleteOne).toHaveBeenCalled();
            expect(Property.findByIdAndUpdate).toHaveBeenCalledWith('propId', { $inc: { numberOfUnits: -1 } });
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });
});
