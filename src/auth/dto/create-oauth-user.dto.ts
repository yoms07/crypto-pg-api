import { z } from 'zod';

export const createOauthUserDto = z.object({
  user: z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    image: z.string().url().optional(),
  }),
  account: z.object({
    access_token: z.string().min(1, 'Access token is required'),
    token_type: z.string().min(1, 'Token type is required'),
    scope: z.string().optional(),
    provider: z.string().min(1, 'Provider is required'),
    type: z.string().min(1, 'Type is required'),
    providerAccountId: z.string().min(1, 'Provider account ID is required'),
  }),
  profile: z.record(z.any()).optional(),
});

export type CreateOauthUserDto = z.infer<typeof createOauthUserDto>;
