import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppRequest } from 'express';

export const CurrentSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AppRequest>();
    return request.session;
  },
);
