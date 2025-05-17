import { z } from 'zod';

export const checkoutCustomizationDto = z.object({
  primaryColor: z.string().default('#0066FF'),
  topBarColor: z.string().default('#FFFFFF'),
  topBarTextColor: z.string().default('#000000'),
  secondaryColor: z.string().default('#F5F5F5'),
  borderRadius: z.string().default('8px'),
  overlayColor: z.string().default('#FFFFFF'),
  bottomBarColor: z.string().default('#FFFFFF'),
  primaryTextColor: z.string().default('#000000'),
  secondaryTextColor: z.string().default('#666666'),
});

export type CheckoutCustomizationDto = z.infer<typeof checkoutCustomizationDto>;

export const defaultCheckoutCustomization: CheckoutCustomizationDto = {
  primaryColor: '#0066FF',
  topBarColor: '#FFFFFF',
  topBarTextColor: '#000000',
  secondaryColor: '#F5F5F5',
  borderRadius: '8px',
  overlayColor: '#FFFFFF',
  bottomBarColor: '#FFFFFF',
  primaryTextColor: '#000000',
  secondaryTextColor: '#666666',
};
