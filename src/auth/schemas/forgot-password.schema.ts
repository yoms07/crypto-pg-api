import { z } from 'zod';

export const forgotPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const verifyForgotPasswordRequestSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;
export type VerifyForgotPasswordRequest = z.infer<
  typeof verifyForgotPasswordRequestSchema
>;

export const forgotPasswordResponseSchema = z.object({
  message: z.string(),
});

export const verifyForgotPasswordResponseSchema = z.object({
  message: z.string(),
});

export type ForgotPasswordResponse = z.infer<
  typeof forgotPasswordResponseSchema
>;
export type VerifyForgotPasswordResponse = z.infer<
  typeof verifyForgotPasswordResponseSchema
>;
