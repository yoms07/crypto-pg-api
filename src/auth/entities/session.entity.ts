import { z } from 'zod';

export const sessionSchema = z.object({
  userId: z.string(),
  name: z.string(),
  provider: z.string(),
  emailVerified: z.boolean(),
  email: z.string().email(),
  isActive: z.boolean(),
  issuedAt: z.date(),
  expiresAt: z.date(),
  refreshExpiresAt: z.date().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});

export type Session = z.infer<typeof sessionSchema>;
