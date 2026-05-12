import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { buildApp } from '../src/app';
import { openDatabase } from '../src/db/database';
import { runMigrations } from '../src/db/migrations';
import type { SqliteDatabase } from '../src/db/sqliteTypes';
import { parseTagsQueryParam } from '../src/models/bookmark';

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

describe('parseTagsQueryParam', () => {
  it('splits on comma, trims, lowercases, and dedupes', () => {
    expect(parseTagsQueryParam('  Alpha , beta ,  ALPHA ')).toEqual(['alpha', 'beta']);
  });

  it('drops empty segments', () => {
    expect(parseTagsQueryParam('a,, , b')).toEqual(['a', 'b']);
  });
});

describe('GET /bookmarks', () => {
  it('returns 200 and an empty array when there are no bookmarks', async () => {
    const db = openDatabase(':memory:');
    runMigrations(db);
    const app = buildApp(db);
    const res = await request(app).get('/bookmarks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all bookmarks (happy path)', async () => {
    const db = openDatabase(':memory:');
    runMigrations(db);
    const id1 = uuidv4();
    const id2 = uuidv4();
    insertBookmark(db, {
      id: id1,
      url: 'https://one.example/',
      title: 'One',
      description: null,
      tags: ['a', 'b'],
    });
    insertBookmark(db, {
      id: id2,
      url: 'https://two.example/',
      title: 'Two',
      description: 'd',
      tags: [],
    });
    const app = buildApp(db);
    const res = await request(app).get('/bookmarks');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map((x: { id: string }) => x.id).sort()).toEqual([id1, id2].sort());
  });

  /**
   * Chunk 2 semantics: `?tags=a,b` keeps bookmarks that match **any** listed tag (OR),
   * compared case-insensitively to stored tags.
   */
  it('filters with OR semantics on ?tags (any match)', async () => {
    const db = openDatabase(':memory:');
    runMigrations(db);
    const idApple = uuidv4();
    const idCherry = uuidv4();
    const idDate = uuidv4();
    insertBookmark(db, {
      id: idApple,
      url: 'https://a.example/',
      title: 'A',
      description: null,
      tags: ['apple', 'banana'],
    });
    insertBookmark(db, {
      id: idCherry,
      url: 'https://c.example/',
      title: 'C',
      description: null,
      tags: ['cherry'],
    });
    insertBookmark(db, {
      id: idDate,
      url: 'https://d.example/',
      title: 'D',
      description: null,
      tags: ['date'],
    });
    const app = buildApp(db);
    const res = await request(app).get('/bookmarks').query({ tags: 'banana,cherry' });
    expect(res.status).toBe(200);
    const ids = res.body.map((x: { id: string }) => x.id).sort();
    expect(ids).toEqual([idApple, idCherry].sort());
  });
});
