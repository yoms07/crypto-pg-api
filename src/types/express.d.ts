import { Request } from 'express';
import { Session } from 'src/auth/entities/session.entity';
import { User } from 'src/auth/schemas';

declare module 'express' {
  interface AppRequest extends Request {
    session?: Session;
    user?: User;
    businessProfile?: BusinessProfile;
  }
}
