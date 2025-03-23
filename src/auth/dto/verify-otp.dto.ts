import { z } from 'zod';

export const verifyOtpDto = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().min(1, 'OTP is required'),
});

export type VerifyOtpDto = z.infer<typeof verifyOtpDto>;
