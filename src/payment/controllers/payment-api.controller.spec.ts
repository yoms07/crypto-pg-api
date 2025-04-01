import { Test, TestingModule } from '@nestjs/testing';
import { PaymentApiController } from './payment-api.controller';
import { PaymentService } from '../services/payment.service';

describe('PaymentController', () => {
  let controller: PaymentApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentApiController],
      providers: [PaymentService],
    }).compile();

    controller = module.get<PaymentApiController>(PaymentApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
