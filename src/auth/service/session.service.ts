import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Session } from '../entities/session.entity';
import { User } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import jwtConfig from 'src/config/jwt.config';

interface JwtPayload {
  sub: string; // user id
  iat: number; // issued at
  exp: number; // expiration time
  email: string;
  userAgent?: string;
  ipAddress?: string;
}

interface RefreshJWTPayload {
  sub: string;
  iat: number;
  exp: number;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name, {
    timestamp: true,
  });

  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(jwtConfig.KEY) private config: ConfigType<typeof jwtConfig>,
  ) {}

  async createSession(
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    session: Session;
  }> {
    const now = Math.floor(Date.now() / 1000);

    // Create access token
    const accessTokenPayload: JwtPayload = {
      sub: user.id as string,
      email: user.email,
      iat: now,
      exp: now + this.config.jwt_session_duration,
    };

    // Create refresh token
    const refreshTokenPayload: RefreshJWTPayload = {
      sub: user.id as string,
      iat: now,
      exp: now + this.config.jwt_refresh_duration,
    };

    const accessToken = await this.jwtService.signAsync(accessTokenPayload, {
      secret: this.config.jwt_session_secret,
    });
    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {
      secret: this.config.jwt_refresh_secret,
    });

    // Create session object
    const session: Session = {
      userId: user.id as string,
      email: user.email,
      issuedAt: new Date(now * 1000),
      expiresAt: new Date((now + this.config.jwt_session_duration) * 1000),
      refreshExpiresAt: new Date(
        (now + this.config.jwt_refresh_duration) * 1000,
      ),
      ipAddress: ipAddress,
      userAgent: userAgent,
    };

    return {
      accessToken,
      refreshToken,
      session,
    };
  }

  async validateSession(token: string): Promise<Session | null> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      // Create session object from payload
      const session: Session = {
        userId: payload.sub,
        email: payload.email,
        issuedAt: new Date(payload.iat * 1000),
        expiresAt: new Date(payload.exp * 1000),
        userAgent: payload.userAgent,
        ipAddress: payload.ipAddress,
      };

      return session;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async refreshSession(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    session: Session;
  }> {
    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync<RefreshJWTPayload>(
        refreshToken,
        {
          secret: this.config.jwt_refresh_secret,
        },
      );

      // Find user
      const user = await this.userModel.findById(payload.sub);
      if (!user) {
        throw new Error('User not found');
      }

      // Create new session
      return this.createSession(user);
    } catch (error) {
      this.logger.error(error);
      throw new Error('Invalid refresh token');
    }
  }
}
