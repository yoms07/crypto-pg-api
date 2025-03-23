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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('email/login')
  @UsePipes(new ZodValidationPipe(loginEmailDto))
  async loginEmail(@Body() loginDto: LoginEmailDto): Promise<OtpWithoutCode> {
    return this.authService.loginEmail(loginDto);
  }

  @Post(':provider/login')
  @UsePipes(new ZodValidationPipe(createOauthUserDto))
  async oauthLogin(
    @Body() createOauthUserDto: CreateOauthUserDto,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const user = await this.authService.oauthLogin(createOauthUserDto);
    const { accessToken, refreshToken } =
      await this.sessionService.createSession(user);
    return { accessToken, refreshToken, user };
  }

  @Post('register-email')
  @UsePipes(new ZodValidationPipe(registerEmailDto))
  async registerEmail(@Body() registerDto: RegisterEmailDto) {
    return this.authService.registerEmail(registerDto);
  }

  @Post('verify-email')
  @UsePipes(new ZodValidationPipe(verifyEmailDto))
  async verifyEmail(@Body() verifyDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyDto);
  }

  @Post('verify-otp')
  @UsePipes(new ZodValidationPipe(verifyOtpDto))
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const user = await this.authService.verifyLoginOtp(verifyOtpDto);
    const { accessToken, refreshToken } =
      await this.sessionService.createSession(user);
    return { accessToken, refreshToken, user };
  }

  @Get('session')
  async validateSession(
    @Query('token') token: string,
  ): Promise<Session | null> {
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    return this.sessionService.validateSession(token);
  }

  @Post('session/refresh')
  async refreshSession(
    @Body('refreshToken') refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string; session: Session }> {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    return this.sessionService.refreshSession(refreshToken);
  }
}
