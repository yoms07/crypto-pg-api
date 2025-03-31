import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AppRequest } from 'express';
import { BusinessProfileService } from '../service/business-profile.service';

@Injectable()
export class BusinessProfileGuard implements CanActivate {
  constructor(private businessProfileService: BusinessProfileService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AppRequest>();

    const businessProfileId = this.extractBusinessProfileId(request);
    if (!businessProfileId) {
      throw new UnauthorizedException('No business profile ID provided');
    }
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('No user provided');
    }

    const businessProfile = await this.businessProfileService.getProfileById(
      user.id as string,
      businessProfileId,
    );
    if (!businessProfile) {
      throw new UnauthorizedException('Invalid business profile ID');
    }

    request.businessProfile = businessProfile;
    return true;
  }

  private extractBusinessProfileId(request: AppRequest): string | undefined {
    const businessProfileId = request.params['businessProfileId'];

    if (!businessProfileId) {
      return undefined;
    }
    return businessProfileId;
  }
}
