import { z } from 'zod';

export const updateWalletDto = z.object({
  wallet_address: z.string().min(1, 'Wallet address is required'),
  wallet_type: z.string().min(1, 'Wallet type is required'),
});

export type UpdateWalletDto = z.infer<typeof updateWalletDto>;
