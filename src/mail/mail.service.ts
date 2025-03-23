import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name); // Add this line for loggin
  constructor(private readonly mailerService: MailerService) {}
  sendVerificationEmail(email: string, name: string, token: string) {
    this.logger.log(
      `Sending verification email to ${email}:${name} with token ${token}`,
    ); // Add this line for loggin
  }

  sendOtpEmail(email: string, name: string, otpCode: string) {
    this.logger.log(
      `Sending verification email to ${email}:${name} with token ${otpCode}`,
    ); // Add this line for loggin
  }
}
