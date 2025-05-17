import { z } from 'zod';

export const createProductSchema = z.object({
  item_name: z.string().min(1),
  item_description: z.string().optional(),
  category: z.string().min(1),
  unit_price: z.string(),
  unit_currency: z.literal('IDR'),
  sku: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  image_url: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
