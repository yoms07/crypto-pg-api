import { Body, Controller, Post, UseGuards, Logger } from '@nestjs/common';
import { MoralisStreamGuard } from './guards/moralis-stream.guard';
import { PaymentService } from '@/payment/services/payment.service';
import { MoralisWebhookEvent } from './dto/inbound-webhook.dto';
import * as ethers from 'ethers';

@Controller('inbound-webhook')
@UseGuards(MoralisStreamGuard)
export class InboundWebhookController {
  private readonly logger = new Logger(InboundWebhookController.name);
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/')
  async handleInboundWebhook(@Body() webhook: MoralisWebhookEvent) {
    try {
      const log = webhook.logs[0];
      if (!log) {
        this.logger.warn('No logs in webhook event');
        return;
      }
      this.logger.log(`Processing webhook event: ${log.transactionHash}`);

      // PaymentProcessed event signature
      const PAYMENT_PROCESSED_TOPIC = ethers.id(
        'PaymentProcessed(address,bytes16,address,address,uint256,address)',
      );

      if (log.topic0 === PAYMENT_PROCESSED_TOPIC) {
        const decodedLog = ethers.AbiCoder.defaultAbiCoder().decode(
          ['address', 'bytes16', 'address', 'address', 'uint256', 'address'],
          log.data,
        );

        const [operator, id, recipient, sender, spentAmount, spentCurrency] =
          decodedLog;

        await this.paymentService.markPaid({
          recipientAmount: spentAmount as string,
          deadline: parseInt(webhook.block.timestamp),
          recipient: recipient as string,
          recipientCurrency: spentCurrency as string,
          refundDestination: sender as string,
          feeAmount: '0',
          id: ethers.hexlify(id as string).slice(2),
          operator: operator as string,
          signature: log.transactionHash,
          prefix: '',
        });

        this.logger.log(`Payment marked as paid: ${id}`);
      }
    } catch (error) {
      this.logger.error('Error processing webhook', error);
      throw error;
    }
  }
}
