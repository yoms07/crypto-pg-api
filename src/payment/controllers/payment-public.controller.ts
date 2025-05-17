import { Controller, Get, Param } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { ApiResponse, ApiResponseBuilder } from '@/common/response.common';
import { PaymentLinkDto } from '../dto/payment-link.dto';

@Controller('/public/payment')
export class PaymentPublicController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<PaymentLinkDto>> {
    const paymentLink = await this.paymentService.findOnePublic(id);
    return ApiResponseBuilder.success(
      PaymentLinkDto.transformToDTOPublic(paymentLink),
      'Payment link retrieved successfully',
    );
  }
}
