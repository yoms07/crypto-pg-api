import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';

import {
  EmailVerification,
  EmailVerificationSchema,
  User,
  UserSchema,
  Otp,
  OtpSchema,
  PasswordReset,
  PasswordResetSchema,
} from './schemas';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './service/auth.service';
import { SessionService } from './service/session.service';
import { MailModule } from 'src/mail/mail.module';
import jwtConfig from 'src/config/jwt.config';
import { AuthGuard } from './guards/auth.guard';
import urlConfig from '@/config/url.config';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: EmailVerification.name,
        schema: EmailVerificationSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Otp.name,
        schema: OtpSchema,
      },
      {
        name: PasswordReset.name,
        schema: PasswordResetSchema,
      },
    ]),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(urlConfig),
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.jwt_session_secret'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionService, AuthGuard],
  exports: [AuthService, SessionService, AuthGuard],
})
export class AuthModule {}
