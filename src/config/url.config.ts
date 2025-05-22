import { registerAs } from '@nestjs/config';

export interface UrlConfig {
  api_public_url: string;
  dashboard_url: string;
}

export default registerAs(
  'url',
  (): UrlConfig => ({
    api_public_url: process.env.PUBLIC_URL!,
    dashboard_url: process.env.DASHBOARD_URL!,
  }),
);
