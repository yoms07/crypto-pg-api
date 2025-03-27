import { z } from 'zod';

export const addApiKeyDto = z.object({
  name: z.string().min(1, 'API key name is required'),
});

export type AddApiKeyDto = z.infer<typeof addApiKeyDto>;
