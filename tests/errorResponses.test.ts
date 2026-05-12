import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';

function memoryApp() {
  return createApp({ databasePath: ':memory:' });
}

describe('GET /bookmarks/:id error responses', () => {
  it('returns 400 with consistent error body for invalid id', async () => {
    const res = await request(memoryApp()).get('/bookmarks/not-a-uuid');
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      error: {
        code: 'BAD_REQUEST',
        message: expect.any(String),
      },
    });
  });

  it('returns 404 with consistent error body when id is valid but missing', async () => {
    const res = await request(memoryApp()).get(
      '/bookmarks/00000000-0000-4000-8000-000000000001',
    );
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      error: {
        code: 'NOT_FOUND',
        message: expect.any(String),
      },
    });
  });
});
