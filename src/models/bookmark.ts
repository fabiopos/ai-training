import { z } from 'zod';

/** UUID path/query param for bookmark routes */
export const bookmarkIdSchema = z.string().uuid();

/** Stored and returned bookmark entity */
export const bookmarkEntitySchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  title: z.string().min(1),
  description: z.string().nullable(),
  tags: z.array(z.string()),
});

export type Bookmark = z.infer<typeof bookmarkEntitySchema>;

/** Request body for creating a bookmark (used by POST in a later chunk) */
export const createBookmarkBodySchema = z.object({
  url: z.string().url(),
  title: z.string().min(1),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateBookmarkBody = z.infer<typeof createBookmarkBodySchema>;
