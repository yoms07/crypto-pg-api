import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  Query,
  UnauthorizedException,
  Res,
  Inject,
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/zod-validation';
import {
  LoginEmailDto,
  loginEmailDto,
  OtpWithoutCode,
} from './dto/login-email.dto';
import { AuthService } from './service/auth.service';
import { SessionService } from './service/session.service';
import {
  CreateOauthUserDto,
  createOauthUserDto,
} from './dto/create-oauth-user.dto';
import { RegisterEmailDto, registerEmailDto } from './dto/register-email.dto';
import { VerifyEmailDto, verifyEmailDto } from './dto/verify-email.dto';
import { VerifyOtpDto, verifyOtpDto } from './dto/verify-otp.dto';
import { Session } from './entities/session.entity';
import { ApiResponse, ApiResponseBuilder } from 'src/common/response.common';
import { Response } from 'express';
import { ConfigType } from '@nestjs/config';
import urlConfig from '@/config/url.config';
import {
  ForgotPasswordRequest,
  forgotPasswordRequestSchema,
  VerifyForgotPasswordRequest,
  verifyForgotPasswordRequestSchema,
} from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    @Inject(urlConfig.KEY)
    private config: ConfigType<typeof urlConfig>,
  ) {}

  @Post('email/login')
  @UsePipes(new ZodValidationPipe(loginEmailDto))
  async loginEmail(
    @Body() loginDto: LoginEmailDto,
  ): Promise<ApiResponse<OtpWithoutCode>> {
    const response = await this.authService.loginEmail(loginDto);
    return ApiResponseBuilder.success(
      response,
      'Successfully login with email',
    );
  }

  @Post('oauth/:provider/login')
  @UsePipes(new ZodValidationPipe(createOauthUserDto))
  async oauthLogin(@Body() createOauthUserDto: CreateOauthUserDto): Promise<
    ApiResponse<{
      accessToken: string;
      refreshToken: string;
      session: Session;
    }>
  > {
    const user = await this.authService.oauthLogin(createOauthUserDto);
    const { accessToken, refreshToken, session } =
      await this.sessionService.createSession(user);
    return ApiResponseBuilder.success(
      { accessToken, refreshToken, session },
      'Successfully login with OAuth provider',
    );
  }

  @Post('register-email')
  @UsePipes(new ZodValidationPipe(registerEmailDto))
  async registerEmail(
    @Body() registerDto: RegisterEmailDto,
  ): Promise<ApiResponse<null>> {
    await this.authService.registerEmail(registerDto);
    return ApiResponseBuilder.success(
      null,
      'Successfully registered email. Please check your email to verify your account',
    );
  }

  @Get('verify-email')
  @UsePipes(new ZodValidationPipe(verifyEmailDto))
  async verifyEmail(@Query() verifyDto: VerifyEmailDto, @Res() res: Response) {
    const response = await this.authService.verifyEmail(verifyDto);
    console.log('frontend_url', this.config.dashboard_url);
    return res.render('verification-success', {
      success: true,
      message: 'Successfully verified email',
      email: response.email,
      frontend_url: this.config.dashboard_url,
    });
  }

  @Post('verify-otp')
  @UsePipes(new ZodValidationPipe(verifyOtpDto))
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<
    ApiResponse<{
      accessToken: string;
      refreshToken: string;
      session: Session;
    }>
  > {
    const user = await this.authService.verifyLoginOtp(verifyOtpDto);
    const { accessToken, refreshToken, session } =
      await this.sessionService.createSession(user);
    return ApiResponseBuilder.success(
      { accessToken, refreshToken, session },
      'Successfully verified OTP',
    );
  }

  @Get('session')
  async validateSession(
    @Query('token') token: string,
  ): Promise<ApiResponse<Session>> {
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    const session = await this.sessionService.validateSession(token);
    if (!session) {
      throw new UnauthorizedException('Invalid token');
    }
    return ApiResponseBuilder.success(
      session,
      'Session validated successfully',
    );
  }

  @Post('session/refresh')
  async refreshSession(@Body('refreshToken') refreshToken: string): Promise<
    ApiResponse<{
      accessToken: string;
      refreshToken: string;
      session: Session;
    }>
  > {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    const response = await this.sessionService.refreshSession(refreshToken);
    return ApiResponseBuilder.success(
      response,
      'Session refreshed successfully',
    );
  }

  @Post('forgot-password')
  @UsePipes(new ZodValidationPipe(forgotPasswordRequestSchema))
  async forgotPassword(
    @Body() request: ForgotPasswordRequest,
  ): Promise<ApiResponse<null>> {
    await this.authService.forgotPassword(request);
    return ApiResponseBuilder.success(
      null,
      'If your email is registered, you will receive a password reset link.',
    );
  }

  @Post('reset-password')
  @UsePipes(new ZodValidationPipe(verifyForgotPasswordRequestSchema))
  async verifyForgotPassword(
    @Body() request: VerifyForgotPasswordRequest,
  ): Promise<ApiResponse<null>> {
    await this.authService.verifyForgotPassword(request);
    return ApiResponseBuilder.success(
      null,
      'Password has been reset successfully',
    );
  }
}
