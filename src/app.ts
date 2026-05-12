import express, { type Express } from 'express';
import { env } from './config/env';
import { openDatabase } from './db/database';
import { runMigrations } from './db/migrations';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { createBookmarksRouter } from './routes/bookmarks';
import { healthRouter } from './routes/health';

export type CreateAppOptions = {
  databasePath?: string;
};

export function createApp(options?: CreateAppOptions): Express {
  const databasePath = options?.databasePath ?? env.databasePath;
  const db = openDatabase(databasePath);
  runMigrations(db);

  const app = express();
  app.use(express.json());

  app.use('/health', healthRouter);
  app.use('/bookmarks', createBookmarksRouter(db));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
