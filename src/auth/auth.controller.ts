import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  Query,
  UnauthorizedException,
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
import { User } from './schemas/user.schema';
import { Session } from './entities/session.entity';
import { ApiResponse, ApiResponseBuilder } from 'src/common/response.common';
import { EmailVerification } from './schemas';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
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

  @Post(':provider/login')
  @UsePipes(new ZodValidationPipe(createOauthUserDto))
  async oauthLogin(@Body() createOauthUserDto: CreateOauthUserDto): Promise<
    ApiResponse<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>
  > {
    const user = await this.authService.oauthLogin(createOauthUserDto);
    const { accessToken, refreshToken } =
      await this.sessionService.createSession(user);
    return ApiResponseBuilder.success(
      { accessToken, refreshToken, user },
      'Successfully login with OAuth provider',
    );
  }

  @Post('register-email')
  @UsePipes(new ZodValidationPipe(registerEmailDto))
  async registerEmail(
    @Body() registerDto: RegisterEmailDto,
  ): Promise<ApiResponse<EmailVerification>> {
    const response = await this.authService.registerEmail(registerDto);
    return ApiResponseBuilder.success(
      response,
      'Successfully registered email',
    );
  }

  @Post('verify-email')
  @UsePipes(new ZodValidationPipe(verifyEmailDto))
  async verifyEmail(
    @Body() verifyDto: VerifyEmailDto,
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const response = await this.authService.verifyEmail(verifyDto);
    return ApiResponseBuilder.success(response, 'Successfully verified email');
  }

  @Post('verify-otp')
  @UsePipes(new ZodValidationPipe(verifyOtpDto))
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<
    ApiResponse<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>
  > {
    const user = await this.authService.verifyLoginOtp(verifyOtpDto);
    const { accessToken, refreshToken } =
      await this.sessionService.createSession(user);
    return ApiResponseBuilder.success(
      { accessToken, refreshToken, user },
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
}
