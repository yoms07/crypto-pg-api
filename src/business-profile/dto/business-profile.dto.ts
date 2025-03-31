import { CheckoutCustomization } from '../schemas/checkout-customization.schema';
import { Wallet } from '../schemas/wallet.schema';

export class ApiKeyDto {
  is_active: boolean;
  last_used_at: Date | null;
  api_key?: string;
}

export class BusinessProfileDto {
  id: string;
  user_id: string;
  business_name: string;
  webhook_url: string;
  webhook_secret: string;
  logo_url: string;
  business_description: string;
  contact_email: string;
  contact_phone: string;
  wallet: Wallet | null;
  api_key: ApiKeyDto | null;
  checkout_customization: CheckoutCustomization;
  created_at: Date;
  updated_at: Date;
}
