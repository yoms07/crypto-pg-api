import { Test, TestingModule } from '@nestjs/testing';
import { InboundWebhookController } from './inbound-webhook.controller';

describe('InboundWebhookController', () => {
  let controller: InboundWebhookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InboundWebhookController],
    }).compile();

    controller = module.get<InboundWebhookController>(InboundWebhookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
