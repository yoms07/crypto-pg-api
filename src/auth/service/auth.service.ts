import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { EmailVerification } from '../schemas/email-verification.schema';
import { Otp } from '../schemas/otp.schema';
import { PasswordReset } from '../schemas/password-reset.schema';
import { Model } from 'mongoose';
import { CreateOauthUserDto } from '../dto/create-oauth-user.dto';
import { RegisterEmailDto } from '../dto/register-email.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { LoginEmailDto, OtpWithoutCode } from '../dto/login-email.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import {
  ForgotPasswordRequest,
  VerifyForgotPasswordRequest,
} from '../dto/forgot-password.dto';
import { hash, compare } from 'bcrypt';
import * as crypto from 'crypto';
import { MailService } from '../../mail/mail.service';
import { Session } from '../entities/session.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Otp.name)
    private otpModel: Model<Otp>,
    @InjectModel(EmailVerification.name)
    private emailVerifModel: Model<EmailVerification>,
    @InjectModel(PasswordReset.name)
    private passwordResetModel: Model<PasswordReset>,
    private mailService: MailService,
  ) {}

  async oauthLogin(createOauthUserDto: CreateOauthUserDto): Promise<User> {
    const { user, account } = createOauthUserDto;

    // Check if user exists with this provider and provider account ID
    const existingUser = await this.userModel.findOne({
      email: user.email,
      provider: account.provider,
      provider_id: account.providerAccountId,
    });

    if (existingUser) {
      // Update user information if needed
      existingUser.name = user.name;
      if (user.image) {
        existingUser.image = user.image;
      }
      await existingUser.save();
      return existingUser;
    }

    // Create new user
    const newUser = new this.userModel({
      name: user.name,
      email: user.email,
      image: user.image,
      provider: account.provider,
      provider_id: account.providerAccountId,
      email_verified: true, // OAuth users are verified by default
      email_verified_at: new Date(),
      is_active: true,
    });

    return await newUser.save();
  }

  async registerEmail(
    registerDto: RegisterEmailDto,
  ): Promise<EmailVerification> {
    // Check if user already exists with email provider
    const existingUser = await this.userModel.findOne({
      email: registerDto.email,
      provider: 'email',
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await hash(registerDto.password, saltRounds);

    // Create user (unverified)
    const newUser = new this.userModel({
      name: registerDto.name,
      email: registerDto.email,
      password_hash: passwordHash,
      provider: 'email',
      email_verified: false,
      is_active: true,
    });

    const savedUser = await newUser.save();

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiration

    // Save verification token
    const verification = new this.emailVerifModel({
      user_id: savedUser._id,
      token,
      expires_at: expiresAt,
      is_used: false,
    });

    const savedVerification = await verification.save();

    // Send verification email
    this.mailService.sendVerificationEmail(
      savedUser.email,
      savedUser.name,
      token,
    );

    return savedVerification;
  }

  async verifyEmail(verifyDto: VerifyEmailDto): Promise<{ email: string }> {
    // Find verification token
    const verification = await this.emailVerifModel.findOne({
      token: verifyDto.token,
      is_used: false,
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Check if token is expired
    if (verification.expires_at < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    // Mark token as used
    verification.is_used = true;
    await verification.save();

    // Update user as verified
    const user = await this.userModel.findById(verification.user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.email_verified = true;
    user.email_verified_at = new Date();
    await user.save();

    return { email: user.email };
  }

  async loginEmail(loginDto: LoginEmailDto): Promise<OtpWithoutCode> {
    // Find user
    const user = await this.userModel.findOne({
      email: loginDto.email,
      provider: 'email',
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is verified
    if (!user.email_verified) {
      // Find the latest verification token
      const latestVerification = await this.emailVerifModel
        .findOne({ user_id: user._id })
        .sort({ created_at: -1 });

      const shouldResendVerification =
        !latestVerification || new Date() > latestVerification.expires_at;

      if (shouldResendVerification) {
        // Generate new verification token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiration

        // Save new verification token
        const verification = new this.emailVerifModel({
          user_id: user._id,
          token,
          expires_at: expiresAt,
          is_used: false,
        });

        await verification.save();

        // Send new verification email
        this.mailService.sendVerificationEmail(user.email, user.name, token);

        throw new UnauthorizedException(
          'Email not verified. A new verification email has been sent.',
        );
      }

      throw new UnauthorizedException(
        'Email not verified. Please check your email for verification link.',
      );
    }

    // Verify password
    const isPasswordValid = await compare(
      loginDto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiration

    // Save OTP
    const otp = new this.otpModel({
      user_id: user._id,
      code: otpCode,
      expires_at: expiresAt,
      is_used: false,
      attempt_count: 0,
      created_at: new Date(),
    });

    const savedOtp = await otp.save();

    // Send OTP email
    this.mailService.sendOtpEmail(user.email, user.name, otpCode);

    // Return OTP (without the code for security)
    return {
      user_id: user.id as string,
      expires_at: savedOtp.expires_at,
      is_used: savedOtp.is_used,
      attempt_count: savedOtp.attempt_count,
      created_at: savedOtp.created_at,
      updated_at: savedOtp.updated_at,
    } as OtpWithoutCode;
  }

  async verifyLoginOtp(verifyOtpDto: VerifyOtpDto): Promise<User> {
    // Find user
    const user = await this.userModel.findOne({
      email: verifyOtpDto.email,
      provider: 'email',
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }

    // Find latest OTP for user
    const otp = await this.otpModel
      .findOne({
        user_id: user._id,
        is_used: false,
      })
      .sort({ created_at: -1 });

    if (!otp) {
      throw new UnauthorizedException('No active OTP found');
    }

    // Check if OTP is expired
    if (otp.expires_at < new Date()) {
      throw new UnauthorizedException('OTP has expired');
    }

    // Check if max attempts reached
    if (otp.attempt_count >= 3) {
      throw new UnauthorizedException('Maximum OTP attempts reached');
    }

    // Verify OTP
    if (otp.code !== verifyOtpDto.otp) {
      otp.attempt_count += 1;
      await otp.save();
      throw new UnauthorizedException('Invalid OTP');
    }

    // Mark OTP as used
    otp.is_used = true;
    await otp.save();

    return user;
  }

  async getUserBySession(session: Session): Promise<User> {
    const user = await this.userModel.findById(session.userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('User account is inactive');
    }

    return user;
  }

  async forgotPassword(
    request: ForgotPasswordRequest,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findOne({
      email: request.email,
      provider: 'email',
    });

    if (!user) {
      // Return success even if user doesn't exist for security
      return {
        message:
          'If your email is registered, you will receive a password reset link.',
      };
    }

    if (!user.email_verified) {
      throw new UnauthorizedException('Email not verified');
    }

    // Check for existing unexpired reset tokens
    const unexpiredTokens = await this.passwordResetModel.countDocuments({
      user_id: user._id,
      is_used: false,
      expires_at: { $gt: new Date() },
    });

    if (unexpiredTokens >= 3) {
      throw new BadRequestException(
        'You have reached the maximum number of active password reset requests. Please wait for the existing ones to expire or use one of them.',
      );
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

    // Save password reset token
    const passwordReset = new this.passwordResetModel({
      user_id: user._id,
      token,
      expires_at: expiresAt,
      is_used: false,
    });

    await passwordReset.save();

    // Send password reset email
    this.mailService.sendPasswordResetEmail(user.email, user.name, token);

    return {
      message:
        'If your email is registered, you will receive a password reset link.',
    };
  }

  async verifyForgotPassword(
    request: VerifyForgotPasswordRequest,
  ): Promise<{ message: string }> {
    // Find password reset token
    const passwordReset = await this.passwordResetModel.findOne({
      token: request.token,
      is_used: false,
    });

    if (!passwordReset) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if token is expired
    if (passwordReset.expires_at < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Find user
    const user = await this.userModel.findById(passwordReset.user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await hash(request.password, saltRounds);

    // Update user's password
    user.password_hash = passwordHash;
    await user.save();

    // Mark token as used
    passwordReset.is_used = true;
    await passwordReset.save();

    return { message: 'Password has been reset successfully' };
  }
}
