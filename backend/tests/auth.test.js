import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
});

describe('Authentication Module Tests', () => {
    describe('POST /api/auth/signup', () => {
        it('should create a new user successfully and return 201', async () => {
            const res = await request(app).post('/api/auth/signup').send({
                fullName: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
            });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBeDefined();
            expect(res.body.data.email).toBe('john@example.com');
            expect(res.body.data.fullName).toBe('John Doe');
        });

        it('should fail to signup if a required field is missing', async () => {
            const res = await request(app).post('/api/auth/signup').send({
                email: 'john@example.com',
                password: 'password123',
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/fields/i);
        });

        it('should fail to signup if password is too short', async () => {
            const res = await request(app).post('/api/auth/signup').send({
                fullName: 'John Doe',
                email: 'john@example.com',
                password: '123',
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/password/i);
        });

        it('should fail if email is already registered', async () => {
            // Pre-register user
            await request(app).post('/api/auth/signup').send({
                fullName: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
            });

            // Try registering again
            const res = await request(app).post('/api/auth/signup').send({
                fullName: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
            });

            expect(res.statusCode).toBe(409);
            expect(res.body.message).toMatch(/exists/i);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Seed a user for login testing
            await request(app).post('/api/auth/signup').send({
                fullName: 'Alice Smith',
                email: 'alice@example.com',
                password: 'securepassword',
            });
        });

        it('should authenticate user and set access/refresh tokens as cookies', async () => {
            const res = await request(app).post('/api/auth/login').send({
                email: 'alice@example.com',
                password: 'securepassword',
            });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe('alice@example.com');

            // Verify cookies are present in response headers
            const cookies = res.headers['set-cookie'] || [];
            const hasAccessToken = cookies.some((c) => c.startsWith('accessToken='));
            const hasRefreshToken = cookies.some((c) => c.startsWith('refreshToken='));

            expect(hasAccessToken).toBe(true);
            expect(hasRefreshToken).toBe(true);
        });

        it('should fail to login with incorrect password', async () => {
            const res = await request(app).post('/api/auth/login').send({
                email: 'alice@example.com',
                password: 'wrongpassword',
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/credentials/i);
        });

        it('should fail to login with unregistered email', async () => {
            const res = await request(app).post('/api/auth/login').send({
                email: 'notfound@example.com',
                password: 'securepassword',
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/credentials/i);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should clear token cookies on logout', async () => {
            const res = await request(app).post('/api/auth/logout').send();

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeNull();

            // Verify cookies are expired in the response headers
            const cookies = res.headers['set-cookie'] || [];

            // Check if cookies expire at Unix epoch
            const accessTokenExpired = cookies.some(
                (c) =>
                    c.includes('accessToken=') &&
                    (c.includes('Expires=Thu, 01 Jan 1970') || c.includes('Max-Age=0')),
            );
            const refreshTokenExpired = cookies.some(
                (c) =>
                    c.includes('refreshToken=') &&
                    (c.includes('Expires=Thu, 01 Jan 1970') || c.includes('Max-Age=0')),
            );

            expect(accessTokenExpired).toBe(true);
            expect(refreshTokenExpired).toBe(true);
        });
    });
});
