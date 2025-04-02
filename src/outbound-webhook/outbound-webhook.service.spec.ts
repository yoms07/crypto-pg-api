import { Test, TestingModule } from '@nestjs/testing';
import { OutboundWebhookService } from './outbound-webhook.service';

describe('OutboundWebhookService', () => {
  let service: OutboundWebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OutboundWebhookService],
    }).compile();

    service = module.get<OutboundWebhookService>(OutboundWebhookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
