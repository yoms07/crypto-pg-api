import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AppRequest } from 'express';
import { BusinessProfile } from '../schemas/business-profile.schema';

export const CurrentBusinessProfile = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): BusinessProfile => {
    const request = ctx.switchToHttp().getRequest<AppRequest>();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('unauthorized');
    }
    return request.businessProfile as BusinessProfile;
  },
);
