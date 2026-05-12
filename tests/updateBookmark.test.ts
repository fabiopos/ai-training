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
    url: 'https://example.com/original',
    title: 'Original',
    description: 'Original description',
    tags: ['original'],
  });
  return res.body as {
    id: string;
    url: string;
    title: string;
    description: string | null;
    tags: string[];
  };
}

describe('PUT /bookmarks/:id', () => {
  it('updates a bookmark and returns 200 with the same id', async () => {
    const app = testApp();
    const existing = await createBookmark(app);

    const res = await request(app).put(`/bookmarks/${existing.id}`).send({
      url: 'https://example.com/updated',
      title: '  Updated title  ',
      description: '  Updated description  ',
      tags: [' API ', 'typescript', 'api', ''],
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: existing.id,
      url: 'https://example.com/updated',
      title: 'Updated title',
      description: 'Updated description',
      tags: ['api', 'typescript'],
    });
  });

  it('persists the updated bookmark', async () => {
    const app = testApp();
    const existing = await createBookmark(app);

    const updated = await request(app).put(`/bookmarks/${existing.id}`).send({
      url: 'https://example.com/persisted-update',
      title: 'Persisted update',
      tags: [],
    });

    const fetched = await request(app).get(`/bookmarks/${existing.id}`);
    expect(updated.status).toBe(200);
    expect(fetched.status).toBe(200);
    expect(fetched.body).toEqual(updated.body);
  });

  it('returns 404 when id is valid but missing', async () => {
    const app = testApp();

    const res = await request(app)
      .put('/bookmarks/11111111-1111-4111-8111-111111111111')
      .send({
        url: 'https://example.com/missing',
        title: 'Missing',
        tags: [],
      });

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      error: { code: 'NOT_FOUND', message: expect.any(String) },
    });
  });

  it('returns 400 when id is malformed', async () => {
    const app = testApp();

    const res = await request(app).put('/bookmarks/not-a-uuid').send({
      url: 'https://example.com/bad-id',
      title: 'Bad id',
      tags: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.error?.code).toBe('BAD_REQUEST');
  });

  it('returns 400 for invalid payload', async () => {
    const app = testApp();
    const existing = await createBookmark(app);

    const res = await request(app).put(`/bookmarks/${existing.id}`).send({
      url: 'not-a-url',
      title: '   ',
      tags: 'not-array',
    });

    expect(res.status).toBe(400);
    expect(res.body.error?.code).toBe('BAD_REQUEST');
  });
});
