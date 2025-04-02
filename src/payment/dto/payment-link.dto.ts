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
  items: any[];
  expired_at: Date;
  created_at: Date;
  updated_at: Date;
}
