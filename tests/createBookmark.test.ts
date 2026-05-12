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

describe('POST /bookmarks', () => {
  it('creates a bookmark and returns 201 with normalized data', async () => {
    const app = testApp();

    const res = await request(app).post('/bookmarks').send({
      url: 'https://example.com/article',
      title: '  Example Article  ',
      description: '  Useful reading  ',
      tags: [' TypeScript ', 'api', 'TYPESCRIPT', '', ' Api '],
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      url: 'https://example.com/article',
      title: 'Example Article',
      description: 'Useful reading',
      tags: ['typescript', 'api'],
    });
    expect(res.body.id).toEqual(expect.any(String));
  });

  it('stores empty tags when tags are omitted', async () => {
    const app = testApp();

    const res = await request(app).post('/bookmarks').send({
      url: 'https://example.com/no-tags',
      title: 'No Tags',
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      url: 'https://example.com/no-tags',
      title: 'No Tags',
      description: null,
      tags: [],
    });
  });

  it('persists the created bookmark so it can be fetched by id', async () => {
    const app = testApp();

    const created = await request(app).post('/bookmarks').send({
      url: 'https://example.com/persisted',
      title: 'Persisted',
      tags: ['Save'],
    });

    const fetched = await request(app).get(`/bookmarks/${created.body.id}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body).toEqual(created.body);
  });

  it('returns 400 for malformed url', async () => {
    const app = testApp();

    const res = await request(app).post('/bookmarks').send({
      url: 'not-a-url',
      title: 'Bad URL',
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      error: { code: 'BAD_REQUEST', message: expect.any(String) },
    });
  });

  it('returns 400 for empty title after trimming', async () => {
    const app = testApp();

    const res = await request(app).post('/bookmarks').send({
      url: 'https://example.com/empty-title',
      title: '   ',
    });

    expect(res.status).toBe(400);
    expect(res.body.error?.code).toBe('BAD_REQUEST');
  });

  it('returns 400 when tags is not an array', async () => {
    const app = testApp();

    const res = await request(app).post('/bookmarks').send({
      url: 'https://example.com/bad-tags',
      title: 'Bad Tags',
      tags: 'typescript',
    });

    expect(res.status).toBe(400);
    expect(res.body.error?.code).toBe('BAD_REQUEST');
  });
});
