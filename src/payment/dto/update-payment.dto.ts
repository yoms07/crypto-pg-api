import { z } from 'zod';
import { createPaymentLinkSchema } from './create-payment.dto';

export const updatePaymentDto = createPaymentLinkSchema.partial();

export type UpdatePaymentDto = z.infer<typeof updatePaymentDto>;
