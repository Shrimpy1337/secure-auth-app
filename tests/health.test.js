const request = require('supertest');
const app = require('../src/app');

describe('GET /api/health', () => {
  it('renvoie un statut 200 et { status: "ok" }', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('POST /api/auth/login', () => {
  it('renvoie 400 si email ou mot de passe manquant', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
  });
});
