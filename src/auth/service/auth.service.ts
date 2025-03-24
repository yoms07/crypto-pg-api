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
import { Model } from 'mongoose';
import { CreateOauthUserDto } from '../dto/create-oauth-user.dto';
import { RegisterEmailDto } from '../dto/register-email.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { LoginEmailDto, OtpWithoutCode } from '../dto/login-email.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { hash, compare } from 'bcrypt';
import * as crypto from 'crypto';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Otp.name)
    private otpModel: Model<Otp>,
    @InjectModel(EmailVerification.name)
    private emailVerifModel: Model<EmailVerification>,
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

  async verifyEmail(verifyDto: VerifyEmailDto) {
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

    return { success: true, message: 'Email verified successfully' };
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
      throw new UnauthorizedException('Email not verified');
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
}
