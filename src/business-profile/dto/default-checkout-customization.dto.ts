import { z } from 'zod';

export const checkoutCustomizationDto = z.object({
  primary_color: z.string().default('#0066FF'),
  secondary_color: z.string().default('#FFFFFF'),
  background_color: z.string().default('#F5F5F5'),
  logo_url: z.string().optional(),
  company_name_display: z.boolean().default(true),
  success_message: z.string().default('Thank you for your payment!'),
  cancel_message: z.string().default('Payment cancelled. Please try again.'),
  button_text: z.string().default('Pay Now'),
  show_powered_by: z.boolean().default(true),
});

export type CheckoutCustomizationDto = z.infer<typeof checkoutCustomizationDto>;

export const defaultCheckoutCustomization: CheckoutCustomizationDto = {
  primary_color: '#0066FF',
  secondary_color: '#FFFFFF',
  background_color: '#F5F5F5',
  company_name_display: true,
  success_message: 'Thank you for your payment!',
  cancel_message: 'Payment cancelled. Please try again.',
  button_text: 'Pay Now',
  show_powered_by: true,
};
