import { z } from 'zod';

export const updateProfileDto = z.object({
  business_name: z.string().min(1).optional(),
  webhook_url: z.string().url().optional(),
  business_description: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  logo_url: z.string().url().optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileDto>;
