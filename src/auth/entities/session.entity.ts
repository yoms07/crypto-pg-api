import { z } from 'zod';

export const sessionSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  issuedAt: z.date(),
  expiresAt: z.date(),
  refreshExpiresAt: z.date().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});

export type Session = z.infer<typeof sessionSchema>;
