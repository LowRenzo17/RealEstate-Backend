import { jest } from '@jest/globals';

jest.unstable_mockModule('../../models/Property.js', () => ({
    default: {
        find: jest.fn(),
        create: jest.fn(),
        findOne: jest.fn(),
        findByIdAndUpdate: jest.fn()
    }
}));

const { getProperties, createProperty, getProperty, updateProperty, deleteProperty } = await import('../../controllers/propertyController.js');
const Property = (await import('../../models/Property.js')).default;

describe('Property Controller Tests', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            user: { id: 'testUserId' },
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

    describe('getProperties', () => {
        it('should get properties for the logged in user', async () => {
            const mockProperties = [{ name: 'Prop 1' }, { name: 'Prop 2' }];
            Property.find.mockResolvedValue(mockProperties);

            await getProperties(mockReq, mockRes, mockNext);

            expect(Property.find).toHaveBeenCalledWith({ ownerId: 'testUserId' });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, count: 2, data: mockProperties });
        });
    });

    describe('createProperty', () => {
        it('should create a property referencing the user', async () => {
            mockReq.body = { name: 'New Prop' };
            Property.create.mockResolvedValue({ _id: 'propId', name: 'New Prop', ownerId: 'testUserId' });

            await createProperty(mockReq, mockRes, mockNext);

            expect(mockReq.body.ownerId).toBe('testUserId');
            expect(Property.create).toHaveBeenCalledWith(mockReq.body);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });
    });

    describe('getProperty', () => {
        it('should return 404 if property not found or unauthorized', async () => {
            mockReq.params.id = 'propId';
            Property.findOne.mockResolvedValue(null);

            await getProperty(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(404);
        });

        it('should return the property if found and authorized', async () => {
            mockReq.params.id = 'propId';
            const mockProp = { _id: 'propId', name: 'Prop' };
            Property.findOne.mockResolvedValue(mockProp);

            await getProperty(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockProp });
        });
    });

    describe('updateProperty', () => {
        it('should return 404 if property not found during update', async () => {
            mockReq.params.id = 'propId';
            Property.findOne.mockResolvedValue(null);

            await updateProperty(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteProperty', () => {
        it('should delete property if authorized', async () => {
            mockReq.params.id = 'propId';
            const mockProperty = {
                _id: 'propId',
                deleteOne: jest.fn().mockResolvedValue(true)
            };
            Property.findOne.mockResolvedValue(mockProperty);

            await deleteProperty(mockReq, mockRes, mockNext);

            expect(mockProperty.deleteOne).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });
});
