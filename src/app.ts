import express, { type Express } from 'express';
import { env } from './config/env';
import type { SqliteDatabase } from './db/sqliteTypes';
import { openDatabase } from './db/database';
import { runMigrations } from './db/migrations';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { createBookmarksRouter } from './routes/bookmarks';
import { healthRouter } from './routes/health';

export type CreateAppOptions = {
  databasePath?: string;
};

export function buildApp(db: SqliteDatabase): Express {
  const app = express();
  app.use(express.json());

  app.use('/health', healthRouter);
  app.use('/bookmarks', createBookmarksRouter(db));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export function createApp(options?: CreateAppOptions): Express {
  const databasePath = options?.databasePath ?? env.databasePath;
  const db = openDatabase(databasePath);
  runMigrations(db);
  return buildApp(db);
}
