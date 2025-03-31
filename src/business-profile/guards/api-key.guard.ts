import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AppRequest } from 'express';
import { BusinessProfileService } from '../service/business-profile.service';

@Injectable()
export class ValidApiKeyGuard implements CanActivate {
  constructor(private businessProfileService: BusinessProfileService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AppRequest>();

    const apiKey = this.extractApiKeyFromHeader(request);
    if (!apiKey) {
      throw new UnauthorizedException('No API key provided');
    }

    const businessProfile =
      await this.businessProfileService.getBusinessProfileByApiKey(apiKey);
    if (!businessProfile) {
      throw new UnauthorizedException('Invalid API key');
    }

    request.businessProfile = businessProfile;
    return true;
  }

  private extractApiKeyFromHeader(request: AppRequest): string | undefined {
    const apiKey = request.headers['x-api-key'];
    if (typeof apiKey === 'string') {
      return apiKey;
    }
    return undefined;
  }
}
