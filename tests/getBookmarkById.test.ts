import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { buildApp } from '../src/app';
import { openDatabase } from '../src/db/database';
import { runMigrations } from '../src/db/migrations';
import type { SqliteDatabase } from '../src/db/sqliteTypes';

function insertBookmark(
  db: SqliteDatabase,
  row: {
    id: string;
    url: string;
    title: string;
    description: string | null;
    tags: string[];
  },
): void {
  const stmt = db.prepare(
    'INSERT INTO bookmarks (id, url, title, description, tags) VALUES (?, ?, ?, ?, ?)',
  );
  stmt.run(row.id, row.url, row.title, row.description, JSON.stringify(row.tags));
}

describe('GET /bookmarks/:id', () => {
  it('returns 200 and the bookmark when it exists (happy path)', async () => {
    const db = openDatabase(':memory:');
    runMigrations(db);
    const id = uuidv4();
    insertBookmark(db, {
      id,
      url: 'https://example.com/page',
      title: 'Example',
      description: 'A note',
      tags: ['read', 'work'],
    });
    const app = buildApp(db);
    const res = await request(app).get(`/bookmarks/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id,
      url: 'https://example.com/page',
      title: 'Example',
      description: 'A note',
      tags: ['read', 'work'],
    });
  });

  it('returns 200 when id in path uses uppercase hex (same resource)', async () => {
    const db = openDatabase(':memory:');
    runMigrations(db);
    const id = uuidv4();
    insertBookmark(db, {
      id,
      url: 'https://up.example/',
      title: 'Up',
      description: null,
      tags: [],
    });
    const app = buildApp(db);
    const res = await request(app).get(`/bookmarks/${id.toUpperCase()}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.title).toBe('Up');
  });

  it('returns 404 when id is valid UUID but no row exists', async () => {
    const db = openDatabase(':memory:');
    runMigrations(db);
    const app = buildApp(db);
    const res = await request(app).get(
      '/bookmarks/11111111-1111-4111-8111-111111111111',
    );
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      error: { code: 'NOT_FOUND', message: expect.any(String) },
    });
  });

  it('returns 400 for non-UUID id', async () => {
    const db = openDatabase(':memory:');
    runMigrations(db);
    const app = buildApp(db);
    const res = await request(app).get('/bookmarks/not-a-uuid');
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      error: { code: 'BAD_REQUEST', message: expect.any(String) },
    });
  });

  it('returns 400 for UUID-shaped string with invalid hex', async () => {
    const db = openDatabase(':memory:');
    runMigrations(db);
    const app = buildApp(db);
    const res = await request(app).get(
      '/bookmarks/gggggggg-gggg-4ggg-gggg-gggggggggggg',
    );
    expect(res.status).toBe(400);
    expect(res.body.error?.code).toBe('BAD_REQUEST');
  });

  it('returns 400 for truncated id', async () => {
    const db = openDatabase(':memory:');
    runMigrations(db);
    const app = buildApp(db);
    const res = await request(app).get('/bookmarks/12345678-1234-4123-8123');
    expect(res.status).toBe(400);
    expect(res.body.error?.code).toBe('BAD_REQUEST');
  });
});
