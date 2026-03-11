import request from 'supertest';
import express from 'express';

const app = express();
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

describe('Basic Setup', () => {
    it('Should successfully run a basic test', () => {
        expect(true).toBe(true);
    });

    it('Should test a basic express route', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('ok');
    });
});
