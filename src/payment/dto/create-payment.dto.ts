import { z } from 'zod';

const customerSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    source: z.enum(['business', 'customer']),
  })
  .refine(
    (data) => {
      if (data.source === 'business') {
        return !!(data.name && data.email && data.address && data.phone);
      }
      return true;
    },
    {
      message:
        'Name, email, address, and phone are required when source is business',
    },
  )
  .refine(
    (data) => {
      if (data.source === 'business' && data.email) {
        return z.string().email().safeParse(data.email).success;
      }
      return true;
    },
    {
      message: 'Invalid email format when source is business',
    },
  );

const pricingSchema = z.object({
  amount: z.string(),
  currency: z.string(),
});

const itemSchema = z.object({
  item_id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  quantity: z.number().int().positive(),
  unit_price: z.string(),
  unit_currency: z.literal('IDR'),
});

export const createPaymentLinkSchema = z.object({
  external_id: z.string(),
  success_redirect_url: z.string().url().optional(),
  failure_redirect_url: z.string().url().optional(),
  description: z.string().optional(),
  customer: customerSchema,
  metadata: z.record(z.any()).optional(),
  pricing: pricingSchema,
  source: z.enum(['api', 'dashboard', 'checkout_link']).optional(),
  items: z.array(itemSchema).optional(),
});

export type CreatePaymentLinkDto = z.infer<typeof createPaymentLinkSchema>;
