import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AppRequest } from 'express';
import { User } from '../schemas';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<AppRequest>();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('unauthorized');
    }
    return request.user as User;
  },
);
