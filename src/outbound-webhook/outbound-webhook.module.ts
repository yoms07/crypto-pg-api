import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OutboundWebhookService } from './outbound-webhook.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  OutboundWebhook,
  OutboundWebhookSchema,
} from './schemas/outbound-webhook.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: OutboundWebhook.name,
        schema: OutboundWebhookSchema,
      },
    ]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [OutboundWebhookService],
  exports: [OutboundWebhookService],
})
export class OutboundWebhookModule {}
