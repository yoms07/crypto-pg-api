import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { ApiResponse, ApiResponseBuilder } from '@/common/response.common';
import { PaymentLinkDto } from '../dto/payment-link.dto';
import {
  InitiatePaymentDto,
  initiatePaymentSchema,
} from '../dto/initiate-payment.dto';
import { ZodValidationPipe } from '@/zod-validation';

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

  @Post(':id/initiate')
  async initiatePayment(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(initiatePaymentSchema))
    initiatePaymentDto: InitiatePaymentDto,
  ): Promise<ApiResponse<any>> {
    const paymentLink = await this.paymentService.findOnePublic(id);
    const paymentIntent = await this.paymentService.initiatePayment(
      paymentLink.business_profile_id,
      id,
      initiatePaymentDto.sender,
    );
    return ApiResponseBuilder.success(
      paymentIntent,
      'Payment initiated successfully',
    );
  }
}
