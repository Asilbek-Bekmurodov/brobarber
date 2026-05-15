const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/barbershop_test');
});

afterAll(async () => {
  await User.deleteMany({ phoneNumber: /^\+99899/ });
  await mongoose.connection.close();
});

describe('POST /api/auth/register', () => {
  it('registers a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Ali', lastName: 'Karimov',
      phoneNumber: '+998991234567', password: 'secret123',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('user');
  });

  it('rejects invalid phone', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Ali', lastName: 'Karimov',
      phoneNumber: '998901234567', password: 'secret123',
    });
    expect(res.status).toBe(400);
    expect(res.body.details[0]).toMatch(/\+998/);
  });

  it('rejects duplicate phone', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Ali', lastName: 'Karimov',
      phoneNumber: '+998991234567', password: 'secret123',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already registered/);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      phoneNumber: '+998991234567', password: 'secret123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      phoneNumber: '+998991234567', password: 'wrongpass',
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns current user with valid token', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      phoneNumber: '+998991234567', password: 'secret123',
    });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.phoneNumber).toBe('+998991234567');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
