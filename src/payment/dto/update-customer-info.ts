import { z } from 'zod';

export const markPendingCompleteSchema = z
  .object({
    sender: z.string().min(1, 'Sender address is required'),
    signature: z.string().min(1, 'Signature is required'),
  })
  .strict();

export const addCustomerInfoSchema = z
  .object({
    sender: z.string().min(1, 'Sender address is required'),
    signature: z.string().min(1, 'Signature is required'),
    customer: z
      .object({
        name: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
      })
      .strict(),
  })
  .strict();

export type MarkPendingCompleteDto = z.infer<typeof markPendingCompleteSchema>;
export type AddCustomerInfoDto = z.infer<typeof addCustomerInfoSchema>;
