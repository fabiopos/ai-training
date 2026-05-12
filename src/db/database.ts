import fs from 'node:fs';
import path from 'node:path';
import type { SqliteDatabase } from './sqliteTypes';

function getDatabaseSyncClass(): new (path: string) => SqliteDatabase {
  // Runtime concatenation so Vitest/Vite does not rewrite `node:sqlite` to `sqlite`.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('node:' + 'sqlite').DatabaseSync;
}

export function openDatabase(databasePath: string): SqliteDatabase {
  const DatabaseSync = getDatabaseSyncClass();
  if (databasePath !== ':memory:') {
    const absolute = path.resolve(databasePath);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    return new DatabaseSync(absolute);
  }
  return new DatabaseSync(':memory:');
}
