import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Request } from 'express';
import * as ethers from 'ethers';
import secretConfig from '@/config/secret.config';

@Injectable()
export class MoralisStreamGuard implements CanActivate {
  constructor(
    @Inject(secretConfig.KEY)
    private config: ConfigType<typeof secretConfig>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const providedSignature = request.headers['x-signature'];

    if (!providedSignature) {
      throw new UnauthorizedException('Signature not provided');
    }

    const payload = JSON.stringify(request.body);
    const generatedSignature = ethers.keccak256(
      ethers.toUtf8Bytes(payload + this.config.moralis_webhook_secret),
    );

    if (generatedSignature !== providedSignature) {
      throw new UnauthorizedException('Invalid signature');
    }

    return true;
  }
}
