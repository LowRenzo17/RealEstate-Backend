import { jest } from '@jest/globals';

jest.unstable_mockModule('../../models/User.js', () => {
    return {
        default: {
            findOne: jest.fn(),
            create: jest.fn(),
            findById: jest.fn()
        }
    };
});

jest.unstable_mockModule('../../utils/generateToken.js', () => {
    return {
        default: jest.fn()
    };
});

// For ESM mocking, we must dynamically import the module under test *after* the mocks are defined.
const { register, login, getMe } = await import('../../controllers/authController.js');
const User = (await import('../../models/User.js')).default;
const generateToken = (await import('../../utils/generateToken.js')).default;

describe('Auth Controller Unit Tests', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            body: {},
            user: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should return 404 if required fields are missing', async () => {
            mockReq.body = { email: 'test@test.com' }; // missing others
            await register(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'All fields are required' });
        });

        it('should return 404 if user already exists', async () => {
            mockReq.body = { name: 'Test', email: 'test@test.com', password: 'password', role: 'tenant' };
            User.findOne.mockResolvedValue({ _id: 'existingId' });

            await register(mockReq, mockRes, mockNext);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'The user already exist!' });
        });

        it('should return 201 and a token on successful registration', async () => {
            mockReq.body = { name: 'Test', email: 'test@test.com', password: 'password', role: 'tenant' };

            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({ _id: 'newUserId' });
            generateToken.mockReturnValue('mockedToken123');

            await register(mockReq, mockRes, mockNext);

            expect(User.create).toHaveBeenCalledWith(mockReq.body);
            expect(generateToken).toHaveBeenCalledWith('newUserId');
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'User created successfully',
                token: 'mockedToken123'
            });
        });

        it('should call next with error if something fails', async () => {
            mockReq.body = { name: 'Test', email: 'test@test.com', password: 'password', role: 'tenant' };
            const error = new Error('Database down');
            User.findOne.mockRejectedValue(error);

            await register(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('login', () => {
        it('should return 400 if email or password missing', async () => {
            mockReq.body = { email: 'test@test.com' }; // missing password
            await login(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('should return 401 if user not found or invalid credentials', async () => {
            mockReq.body = { email: 'test@test.com', password: 'wrong' };

            // Mock a user with a failed matchPassword method
            const mockUser = {
                matchPassword: jest.fn().mockResolvedValue(false)
            };

            // Note: mongoose query mock needs to support .select()
            const mockSelect = jest.fn().mockResolvedValue(mockUser);
            User.findOne.mockReturnValue({ select: mockSelect });

            await login(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Invalid credentials' });
        });

        it('should return 200 and a token on successful login', async () => {
            mockReq.body = { email: 'test@test.com', password: 'correct' };

            const mockUser = {
                _id: 'authId123',
                matchPassword: jest.fn().mockResolvedValue(true)
            };

            const mockSelect = jest.fn().mockResolvedValue(mockUser);
            User.findOne.mockReturnValue({ select: mockSelect });
            generateToken.mockReturnValue('loginMockToken');

            await login(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Login successfully',
                token: 'loginMockToken'
            });
        });
    });

    describe('getMe', () => {
        it('should return 200 and user data', async () => {
            mockReq.user.id = 'userId123';
            User.findById.mockResolvedValue({ _id: 'userId123', name: 'TestUser' });

            await getMe(mockReq, mockRes, mockNext);

            expect(User.findById).toHaveBeenCalledWith('userId123');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: { _id: 'userId123', name: 'TestUser' }
            });
        });
    });
});
