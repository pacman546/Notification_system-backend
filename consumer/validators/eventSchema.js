import { z } from 'zod';

export const eventSchema = z.object({
  type: z.enum(['LIKE', 'COMMENT', 'SHARE']),
  actorId: z.string().min(1),
  targetId: z.string().min(1),
  postId: z.string().min(1),
  timestamp: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid timestamp format'
  }),
});
