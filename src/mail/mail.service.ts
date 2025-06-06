import { MailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import urlConfig from 'src/config/url.config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name); // Add this line for loggin
  constructor(
    private readonly mailerService: MailerService,
    @Inject(urlConfig.KEY) private config: ConfigType<typeof urlConfig>,
  ) {}
  sendVerificationEmail(email: string, name: string, token: string) {
    const verificationUrl = `${this.config.api_public_url}/auth/verify-email?token=${token}`;
    this.logger.log(
      `Sending verification email to ${email}:${name} with token ${token}`,
    ); // Add this line for loggin
    this.mailerService
      .sendMail({
        to: email,
        subject: 'Lisk PG - Verify your email',
        template: 'verification-mail',
        context: {
          name,
          verificationUrl,
        },
      })
      .then(() => {
        this.logger.log(`Verification email sent to ${email}`); // Add this line for loggin
      })
      .catch((error) => {
        this.logger.error(
          `Failed to send verification email to ${email}`,
          error,
        ); // Add this line for loggin
      });
  }

  sendOtpEmail(email: string, name: string, otpCode: string) {
    this.logger.log(
      `Sending verification email to ${email}:${name} with token ${otpCode}`,
    ); // Add this line for loggin
    this.mailerService
      .sendMail({
        to: email,
        subject: 'Lisk PG - Verify your email',
        template: 'otp-mail',
        context: {
          name,
          otpCode,
        },
      })
      .then(() => {
        this.logger.log(`Verification email sent to ${email}`); // Add this line for loggin
      })
      .catch((error) => {
        this.logger.error(
          `Failed to send verification email to ${email}`,
          error,
        ); // Add this line for loggin
      });
  }

  sendPasswordResetEmail(email: string, name: string, token: string) {
    const resetUrl = `${this.config.dashboard_url}/auth/reset-password?token=${token}`;
    this.logger.log(
      `Sending password reset email to ${email}:${name} with token ${token}`,
    );
    this.mailerService
      .sendMail({
        to: email,
        subject: 'Lisk PG - Reset your password',
        template: 'password-reset-mail',
        context: {
          name,
          resetUrl,
          currentYear: new Date().getFullYear(),
        },
      })
      .then(() => {
        this.logger.log(`Password reset email sent to ${email}`);
      })
      .catch((error) => {
        this.logger.error(
          `Failed to send password reset email to ${email}`,
          error,
        );
      });
  }
}
