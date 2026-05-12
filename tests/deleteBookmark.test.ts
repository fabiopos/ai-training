import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';
import { openDatabase } from '../src/db/database';
import { runMigrations } from '../src/db/migrations';

function testApp() {
  const db = openDatabase(':memory:');
  runMigrations(db);
  return buildApp(db);
}

async function createBookmark(app: ReturnType<typeof buildApp>) {
  const res = await request(app).post('/bookmarks').send({
    url: 'https://example.com/delete-me',
    title: 'Delete me',
    tags: ['cleanup'],
  });
  return res.body as { id: string };
}

describe('DELETE /bookmarks/:id', () => {
  it('deletes an existing bookmark and returns 204 No Content', async () => {
    const app = testApp();
    const existing = await createBookmark(app);

    const res = await request(app).delete(`/bookmarks/${existing.id}`);

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
  });

  it('removes the bookmark so it cannot be fetched afterward', async () => {
    const app = testApp();
    const existing = await createBookmark(app);

    await request(app).delete(`/bookmarks/${existing.id}`);
    const fetched = await request(app).get(`/bookmarks/${existing.id}`);

    expect(fetched.status).toBe(404);
    expect(fetched.body.error?.code).toBe('NOT_FOUND');
  });

  it('returns 404 when id is valid but missing', async () => {
    const app = testApp();

    const res = await request(app).delete(
      '/bookmarks/11111111-1111-4111-8111-111111111111',
    );

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      error: { code: 'NOT_FOUND', message: expect.any(String) },
    });
  });

  it('returns 400 when id is malformed', async () => {
    const app = testApp();

    const res = await request(app).delete('/bookmarks/not-a-uuid');

    expect(res.status).toBe(400);
    expect(res.body.error?.code).toBe('BAD_REQUEST');
  });
});
