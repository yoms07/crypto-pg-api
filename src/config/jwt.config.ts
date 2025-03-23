import { registerAs } from '@nestjs/config';

export interface JwtConfig {
  jwt_session_secret: string;
  jwt_session_duration: number;
  jwt_refresh_secret: string;
  jwt_refresh_duration: number;
}

export default registerAs(
  'jwt',
  (): JwtConfig => ({
    jwt_session_secret: process.env.JWT_SESSION_SECRET || 'secret',
    jwt_session_duration:
      (process.env.JWT_SESSION_DURATION &&
        parseInt(process.env.JWT_SESSION_DURATION, 10)) ||
      60 * 60 * 24,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET || 'jwt-refresh-secret',
    jwt_refresh_duration:
      (process.env.JWT_REFRESH_DURATION &&
        parseInt(process.env.JWT_REFRESH_DURATION, 10)) ||
      60 * 60 * 24 * 7, // 7 day,
  }),
);
