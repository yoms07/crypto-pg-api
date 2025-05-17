import { z } from 'zod';

export const updateCheckoutCustomizationDto = z.object({
  primaryColor: z.string().optional(),
  topBarColor: z.string().optional(),
  topBarTextColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  borderRadius: z.string().optional(),
  overlayColor: z.string().optional(),
  bottomBarColor: z.string().optional(),
  primaryTextColor: z.string().optional(),
  secondaryTextColor: z.string().optional(),
});

export type UpdateCheckoutCustomizationDto = z.infer<
  typeof updateCheckoutCustomizationDto
>;
