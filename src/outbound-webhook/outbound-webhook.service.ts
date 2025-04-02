import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import axios, { AxiosError } from 'axios';
import { BusinessProfile } from '@/business-profile/schemas/business-profile.schema';
import { PaymentLink } from '@/payment/schemas/payment-link.schema';
import { OutboundWebhook } from './schemas/outbound-webhook.schema';

@Injectable()
export class OutboundWebhookService {
  private readonly logger = new Logger(OutboundWebhookService.name);

  constructor(
    @InjectModel(OutboundWebhook.name)
    private outboundWebhookModel: Model<OutboundWebhook>,
  ) {}

  private generateSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  private async sendWebhook(
    businessProfile: BusinessProfile,
    paymentLink: PaymentLink,
    event: string,
    data: Record<string, any>,
  ): Promise<void> {
    if (!businessProfile.webhook_url) {
      this.logger.warn(
        `No webhook URL configured for business ${businessProfile.id}`,
      );
      return;
    }

    const eventId = crypto.randomUUID();
    const timestamp = Date.now();

    const payload = {
      id: eventId,
      timestamp,
      event,
      data,
    };

    const signature = this.generateSignature(
      JSON.stringify(payload),
      businessProfile.webhook_secret,
    );

    const headers = {
      'Content-Type': 'application/json',
      'X-Lisk-PG-Signature': signature,
      'X-Webhook-ID': eventId,
    };

    const webhook = new this.outboundWebhookModel({
      business_profile_id: businessProfile._id,
      payment_link_id: paymentLink._id,
      url: businessProfile.webhook_url,
      method: 'POST',
      payload: { event, data },
      headers,
      status: 'pending',
      last_attempted_at: new Date(),
    });

    try {
      const response = await axios.post(businessProfile.webhook_url, payload, {
        headers,
      });

      webhook.status_code = response.status;
      webhook.response_body = JSON.stringify(response.data);
      webhook.status = 'success';
    } catch (error: unknown) {
      webhook.status = 'failed';
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      let logMessage = `Webhook delivery failed: ${error}`;
      if (error instanceof AxiosError) {
        webhook.status_code = error.response?.status || 500;
        webhook.error_message = error.message;
        logMessage = `Webhook delivery failed: ${
          error.response?.data || error.message
        }`;
      } else {
        webhook.status_code = 500;
        webhook.error_message = 'Unknown error';
      }

      this.logger.error(logMessage);
    }

    await webhook.save();
  }

  async sendPaymentSuccessWebhook(
    businessProfile: BusinessProfile,
    paymentLink: PaymentLink,
    transactionHash: string,
  ): Promise<void> {
    await this.sendWebhook(businessProfile, paymentLink, 'payment.success', {
      payment_id: paymentLink.payment_id,
      external_id: paymentLink.external_id,
      status: 'completed',
      transaction_hash: transactionHash,
      completed_at: new Date().toISOString(),
    });
  }

  async sendPaymentFailedWebhook(
    businessProfile: BusinessProfile,
    paymentLink: PaymentLink,
    reason: string,
  ): Promise<void> {
    await this.sendWebhook(businessProfile, paymentLink, 'payment.failed', {
      payment_id: paymentLink.payment_id,
      external_id: paymentLink.external_id,
      status: 'failed',
      reason,
      failed_at: new Date().toISOString(),
    });
  }
}
