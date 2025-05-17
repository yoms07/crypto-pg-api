import { z } from 'zod';

export const updateProductSchema = z.object({
  item_name: z.string().min(1).optional(),
  item_description: z.string().optional(),
  category: z.string().min(1).optional(),
  unit_price: z.string().optional(),
  unit_currency: z.literal('IDR').optional(),
  sku: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  image_url: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  is_active: z.boolean().optional(),
});

export type UpdateProductDto = z.infer<typeof updateProductSchema>;
