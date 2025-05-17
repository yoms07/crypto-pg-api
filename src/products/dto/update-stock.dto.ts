import { z } from 'zod';

export const updateStockSchema = z.object({
  quantity: z.number().int('Quantity must be an integer'),
});

export type UpdateStockDto = z.infer<typeof updateStockSchema>;
