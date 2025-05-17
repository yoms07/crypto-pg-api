import { z } from 'zod';

export const initiatePaymentSchema = z.object({
  sender: z.string().min(1, 'Sender address is required'),
});

export type InitiatePaymentDto = z.infer<typeof initiatePaymentSchema>;
