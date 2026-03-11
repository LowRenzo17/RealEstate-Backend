import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';

// A mock user for tests that require an ID but not necessarily database state,
// though in these tests we mostly check for 401 Unauthorized or 400 Bad Request
// without hitting the DB intensely.

describe('Backend API Integration Tests', () => {
    // Disconnect from any stray mongoose connections so Jest exits cleanly
    afterAll(async () => {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
    });

    describe('Authentication Routes (/api/auth)', () => {
        it('Should return 400 for register without required fields', async () => {
            const res = await request(app).post('/api/auth/register').send({});
            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toBe(false);
        });

        it('Should return 400 for login without credentials', async () => {
            const res = await request(app).post('/api/auth/login').send({});
            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toBe(false);
        });

        it('Should be unauthorized (401) to fetch "me" without token', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toMatch(/Not authorized/i);
        });
    });

    describe('Property Routes (/api/properties)', () => {
        it('Should restrict access without token to GET properties', async () => {
            const res = await request(app).get('/api/properties');
            expect(res.statusCode).toEqual(401);
        });

        it('Should restrict POST properties without auth', async () => {
            const res = await request(app).post('/api/properties').send({ name: 'Test Property' });
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('Unit Routes (/api/units)', () => {
        it('Should restrict access to GET units without token', async () => {
            const dummyId = new mongoose.Types.ObjectId().toString();
            const res = await request(app).get(`/api/properties/${dummyId}/units`);
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('Tenant Routes (/api/tenants)', () => {
        it('Should restrict access without auth token', async () => {
            const res = await request(app).get('/api/tenants');
            expect(res.statusCode).toEqual(401);
        });

        it('Should restrict creating a tenant without auth', async () => {
            const res = await request(app).post('/api/tenants').send({});
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('Payment Routes (/api/payments)', () => {
        it('Should restrict access without auth token', async () => {
            const res = await request(app).get('/api/payments');
            expect(res.statusCode).toEqual(401);
        });

        it('Should restrict creating an mpesa push without auth', async () => {
            // NOTE: Assuming stk-push is protected
            const res = await request(app).post('/api/payments/mpesa/stk-push').send({});
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('Maintenance Routes (/api/maintenance)', () => {
        it('Should restrict GET requests without auth', async () => {
            const res = await request(app).get('/api/maintenance');
            expect(res.statusCode).toEqual(401);
        });
    });

    // Basic security and rate limit checks
    describe('Security and Middleware Configuration', () => {
        it('Should have security headers (Helmet)', async () => {
            const res = await request(app).get('/api/auth/login');
            expect(res.headers).toHaveProperty('x-xss-protection');
            expect(res.headers).toHaveProperty('x-frame-options');
        });

        it('Should handle unknown routes correctly (404)', async () => {
            const res = await request(app).get('/api/does-not-exist');
            // Express default HTML 404 response or custom json response
            expect(res.statusCode).toEqual(404);
        });
    });
});
