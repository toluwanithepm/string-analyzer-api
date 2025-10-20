const request = require('supertest');
const app = require('../src/app');

// These tests are illustrative. They assume a test Supabase environment or a mocked client.
// You should configure a test database or mock supabase client to run reliably in CI.

describe('String API sanity', () => {
  test('health check', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  // More tests need Supabase test DB or mocking — left as TODO
});
