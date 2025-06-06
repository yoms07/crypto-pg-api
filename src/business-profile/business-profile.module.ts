import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessProfileController } from './business-profile.controller';
import { BusinessProfileService } from './service/business-profile.service';
import {
  BusinessProfile,
  BusinessProfileSchema,
} from './schemas/business-profile.schema';
import { ApiKey, ApiKeySchema } from './schemas/api-key.schema';
import { Wallet, WalletSchema } from './schemas/wallet.schema';
import {
  CheckoutCustomization,
  CheckoutCustomizationSchema,
} from './schemas/checkout-customization.schema';
import { AuthModule } from '@/auth/auth.module';
import { ApiKeyService } from './service/api-key.service';
import { ConfigModule } from '@nestjs/config';
import secretConfig from '@/config/secret.config';

@Module({
  imports: [
    ConfigModule.forFeature(secretConfig),
    MongooseModule.forFeature([
      { name: BusinessProfile.name, schema: BusinessProfileSchema },
      { name: ApiKey.name, schema: ApiKeySchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: CheckoutCustomization.name, schema: CheckoutCustomizationSchema },
    ]),
    AuthModule,
  ],
  controllers: [BusinessProfileController],
  providers: [BusinessProfileService, ApiKeyService],
  exports: [BusinessProfileService], // Export the service for use in other modules, e.g., Ap
})
export class BusinessProfileModule {}
