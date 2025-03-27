import { z } from 'zod';

export const updateWalletDto = z.object({
  address: z.string().min(1, 'Wallet address is required'),
  type: z.enum(['lisk', 'ethereum']),
});

export type UpdateWalletDto = z.infer<typeof updateWalletDto>;
