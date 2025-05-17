import { z } from 'zod';

const customerSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  address: z.string(),
  phone: z.string(),
  source: z.enum(['business', 'customer']),
});

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
