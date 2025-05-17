import { z } from 'zod';

export const verifyEmailDto = z
  .object({
    token: z.string().min(1, 'Verification token is required'),
  })
  .strict();

export type VerifyEmailDto = z.infer<typeof verifyEmailDto>;
