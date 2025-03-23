import { z } from 'zod';

export const registerEmailDto = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type RegisterEmailDto = z.infer<typeof registerEmailDto>;
