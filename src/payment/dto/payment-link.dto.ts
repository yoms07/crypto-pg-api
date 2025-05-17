import { PaymentLink } from '../schemas/payment-link.schema';

export interface AssetDto {
  type: string;
  address: string;
  chainId: number;
  decimals: number;
}

export interface CustomerDto {
  name: string;
  email: string;
  address: string;
  phone: string;
  source: 'business' | 'customer';
}

export interface CheckoutCustomizationDto {
  primaryColor?: string;
  topBarColor?: string;
  topBarTextColor?: string;
  secondaryColor?: string;
  borderRadius?: string;
  overlayColor?: string;
  bottomBarColor?: string;
  primaryTextColor?: string;
  secondaryTextColor?: string;
}

export class PaymentLinkDto {
  id: string;
  business_profile_id: string;
  payment_id: string;
  external_id: string;
  status: string;
  success_redirect_url?: string;
  failure_redirect_url?: string;
  customer?: CustomerDto;
  metadata?: Record<string, any>;
  pricing: {
    local: {
      amount: string;
      asset: AssetDto;
    };
  };
  source: string;
  items: any[];
  expired_at: Date;
  created_at: Date;
  updated_at: Date;
  checkout_customization?: CheckoutCustomizationDto;

  static transformToDTO(paymentLink: PaymentLink): PaymentLinkDto {
    return {
      id: paymentLink.id as string,
      business_profile_id: paymentLink.business_profile_id._id as string,
      payment_id: paymentLink.payment_id,
      external_id: paymentLink.external_id,
      status: paymentLink.status,
      success_redirect_url: paymentLink.success_redirect_url,
      failure_redirect_url: paymentLink.failure_redirect_url,
      customer: paymentLink.customer,
      metadata: paymentLink.metadata,
      pricing: {
        local: {
          amount: paymentLink.pricing.local.amount,
          asset: paymentLink.pricing.local.asset,
        },
      },
      items: paymentLink.items || [],
      expired_at: paymentLink.expired_at,
      created_at: paymentLink.created_at,
      updated_at: paymentLink.updated_at,
      source: paymentLink.source,
      checkout_customization:
        paymentLink.business_profile_id?.checkout_customization,
    };
  }
}
