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

export const createPaymentLinkSchema = z.object({
  external_id: z.string(),
  success_redirect_url: z.string().url().optional(),
  failure_redirect_url: z.string().url().optional(),
  description: z.string().optional(),
  customer: customerSchema,
  metadata: z.record(z.any()).optional(),
  pricing: pricingSchema,
  source: z.enum(['api', 'dashboard', 'checkout_link']).optional(),
});

export type CreatePaymentLinkDto = z.infer<typeof createPaymentLinkSchema>;
