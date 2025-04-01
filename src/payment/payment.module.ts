import { Module } from '@nestjs/common';
import { PaymentService } from './services/payment.service';
import { PaymentController } from './controllers/payment.controller';
import { Web3Service } from './services/web3.service';
import { PaymentApiController } from './controllers/payment-api.controller';

@Module({
  controllers: [PaymentController, PaymentApiController],
  providers: [PaymentService, Web3Service],
})
export class PaymentModule {}
