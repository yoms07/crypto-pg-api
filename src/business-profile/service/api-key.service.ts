import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyService {
  private readonly encryptionKey: Buffer;
  private readonly logger = new Logger(ApiKeyService.name);

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('API_KEY_SECRET')!;
    this.encryptionKey = crypto.scryptSync(secretKey, 'salt', 32);
  }

  hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  generateApiKey(): {
    keyValue: string;
    keyHash: string;
    encryptedKey: string;
  } {
    const keyValue = crypto.randomBytes(32).toString('hex');
    const keyHash = this.hashApiKey(keyValue);
    const encryptedKey = this.encryptApiKey(keyValue);

    return { keyValue, keyHash, encryptedKey };
  }

  private encryptApiKey(apiKey: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  decryptApiKey(encryptedData: string): string {
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      this.encryptionKey,
      iv,
    );
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  verifyApiKey(apiKey: string, encryptedKey: string): boolean {
    try {
      const decryptedKey = this.decryptApiKey(encryptedKey);
      return decryptedKey === apiKey;
    } catch (error) {
      this.logger.error('Error verifying API key', error);
      return false;
    }
  }
}
