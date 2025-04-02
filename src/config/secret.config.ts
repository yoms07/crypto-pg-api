import { registerAs } from '@nestjs/config';

export interface SecretConfig {
  api_key_secret: string;
  moralis_webhook_secret: string;
}

export default registerAs(
  'secret',
  (): SecretConfig => ({
    api_key_secret: process.env.API_KEY_SECRET!,
    moralis_webhook_secret: process.env.MORALIS_WEBHOOK_SECRET!,
  }),
);
