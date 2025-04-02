import { Module } from '@nestjs/common';
import { InboundWebhookController } from './inbound-webhook.controller';
import { ConfigModule } from '@nestjs/config';
import secretConfig from '@/config/secret.config';
import { MoralisStreamGuard } from './guards/moralis-stream.guard';
import { PaymentModule } from '@/payment/payment.module';

@Module({
  imports: [ConfigModule.forFeature(secretConfig), PaymentModule],
  controllers: [InboundWebhookController],
  providers: [MoralisStreamGuard],
})
export class InboundWebhookModule {}
