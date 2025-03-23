import { z } from 'zod';

export const loginEmailDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginEmailDto = z.infer<typeof loginEmailDto>;

export const otpResponseDto = z.object({
  user_id: z.string(),
  expires_at: z.date(),
  is_used: z.boolean(),
  attempt_count: z.number(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type OtpWithoutCode = z.infer<typeof otpResponseDto>;
