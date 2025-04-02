import { Module } from '@nestjs/common';
import { PaymentService } from './services/payment.service';
import { PaymentController } from './controllers/payment.controller';
import { Web3Service } from './services/web3.service';
import { PaymentApiController } from './controllers/payment-api.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentLink, PaymentLinkSchema } from './schemas/payment-link.schema';
import { ConfigModule } from '@nestjs/config';
import web3Config from '@/config/web3.config';
import { OutboundWebhookModule } from '@/outbound-webhook/outbound-webhook.module';
import { AuthModule } from '@/auth/auth.module';
import { BusinessProfileModule } from '@/business-profile/business-profile.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PaymentLink.name,
        schema: PaymentLinkSchema,
      },
    ]),
    ConfigModule.forFeature(web3Config),
    AuthModule,
    OutboundWebhookModule,
    BusinessProfileModule,
  ],
  controllers: [PaymentController, PaymentApiController],
  providers: [Web3Service, PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
