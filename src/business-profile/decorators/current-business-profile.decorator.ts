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
    if (!request.businessProfile) {
      throw new UnauthorizedException('unauthorized');
    }

    return request.businessProfile as BusinessProfile;
  },
);
