const request = require('supertest');
const app = require('../src/app');

// Ces tests valident la couche de validation, exécutée AVANT tout accès à la base de
// données — ils ne nécessitent donc pas de vraie connexion MongoDB pour tourner en CI.

describe('POST /api/auth/register - validation des entrées', () => {
  it('rejette un email invalide avec un 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'pas-un-email', password: 'motdepasse123' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('rejette un mot de passe trop court avec un 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', password: 'court' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('rejette une requête sans email ni mot de passe', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/auth/me - route protégée', () => {
  it("refuse l'accès sans token avec un 401", async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });
});
