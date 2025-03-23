import { registerAs } from '@nestjs/config';

export interface MailerConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

export default registerAs(
  'mailer',
  (): MailerConfig => ({
    host: process.env.MAILER_HOST!,
    port:
      (process.env.MAILER_PORT && parseInt(process.env.MAILER_PORT, 10)) || 587,
    user: process.env.MAILER_USER!,
    pass: process.env.MAILER_PASS!,
  }),
);
