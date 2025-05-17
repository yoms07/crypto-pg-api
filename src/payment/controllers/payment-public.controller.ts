import { Controller, Get, Param, Post, Body, Patch } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { ApiResponse, ApiResponseBuilder } from '@/common/response.common';
import { PaymentLinkDto } from '../dto/payment-link.dto';
import {
  InitiatePaymentDto,
  initiatePaymentSchema,
} from '../dto/initiate-payment.dto';
import { ZodValidationPipe } from '@/zod-validation';
import {
  AddCustomerInfoDto,
  addCustomerInfoSchema,
  MarkPendingCompleteDto,
  markPendingCompleteSchema,
} from '../dto/update-customer-info';

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

  @Patch(':id/mark-pending-complete')
  async markPendingComplete(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(markPendingCompleteSchema))
    dto: MarkPendingCompleteDto,
  ): Promise<ApiResponse<PaymentLinkDto>> {
    const paymentLink = await this.paymentService.markPendingComplete(
      id,
      dto.sender,
      dto.signature,
    );
    return ApiResponseBuilder.success(
      PaymentLinkDto.transformToDTOPublic(paymentLink),
      'Payment marked as pending-complete successfully',
    );
  }

  @Patch(':id/customer')
  async addCustomerInfo(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(addCustomerInfoSchema))
    dto: AddCustomerInfoDto,
  ): Promise<ApiResponse<PaymentLinkDto>> {
    const paymentLink = await this.paymentService.addCustomerInfo(
      id,
      dto.sender,
      dto.signature,
      dto.customer,
    );
    return ApiResponseBuilder.success(
      PaymentLinkDto.transformToDTOPublic(paymentLink),
      'Customer info added successfully',
    );
  }
}
