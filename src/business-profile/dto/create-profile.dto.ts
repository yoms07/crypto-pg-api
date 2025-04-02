import { z } from 'zod';

export const createProfileDto = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  business_description: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  logo_url: z.string().url().optional(),
});

export type CreateProfileDto = z.infer<typeof createProfileDto>;
