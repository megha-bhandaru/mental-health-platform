const request = require('supertest');
const app = require('../server');

describe('MindSpace API Tests', () => {

  test('TC001 - Health check returns UP', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  test('TC002 - Get resources returns array', async () => {
    const res = await request(app).get('/api/resources');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('TC003 - Log mood without mood field fails', async () => {
    const res = await request(app)
      .post('/api/mood')
      .send({ note: 'no mood given' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

});