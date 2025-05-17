import { Controller, Get, Param } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { ApiResponse, ApiResponseBuilder } from '@/common/response.common';
import { PaymentLinkDto } from '../dto/payment-link.dto';
import { PaymentLink } from '../schemas/payment-link.schema';

@Controller('/public/payment')
export class PaymentPublicController {
  constructor(private readonly paymentService: PaymentService) {}

  private transformToDto(paymentLink: PaymentLink): PaymentLinkDto {
    return {
      id: paymentLink.id as string,
      business_profile_id: paymentLink.business_profile_id._id as string,
      payment_id: paymentLink.payment_id,
      external_id: paymentLink.external_id,
      status: paymentLink.status,
      success_redirect_url: paymentLink.success_redirect_url,
      failure_redirect_url: paymentLink.failure_redirect_url,
      customer: paymentLink.customer,
      metadata: paymentLink.metadata,
      pricing: {
        local: {
          amount: paymentLink.pricing.local.amount,
          asset: paymentLink.pricing.local.asset,
        },
      },
      items: paymentLink.items || [],
      expired_at: paymentLink.expired_at,
      created_at: paymentLink.created_at,
      updated_at: paymentLink.updated_at,
      checkout_customization:
        paymentLink.business_profile_id.checkout_customization,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<PaymentLinkDto>> {
    const paymentLink = await this.paymentService.findOnePublic(id);
    return ApiResponseBuilder.success(
      this.transformToDto(paymentLink),
      'Payment link retrieved successfully',
    );
  }
}
