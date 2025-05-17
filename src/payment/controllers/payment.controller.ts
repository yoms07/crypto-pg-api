import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Put,
} from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { AuthGuard } from '@/auth/guards/auth.guard';
import { CurrentBusinessProfile } from '@/business-profile/decorators/current-business-profile.decorator';
import { BusinessProfile } from '@/business-profile/schemas/business-profile.schema';
import {
  CreatePaymentLinkDto,
  createPaymentLinkSchema,
} from '../dto/create-payment.dto';
import { ApiResponse, ApiResponseBuilder } from '@/common/response.common';
import { ZodValidationPipe } from '@/zod-validation';
import {
  PaginationQuery,
  paginationSchema,
  toPaginationMetadata,
} from '@/common/pagination.common';
import { BusinessProfileGuard } from '@/business-profile/guards/business-profile-param.guard';
import { PaymentLinkDto } from '../dto/payment-link.dto';

@Controller('/payment/:businessProfileId')
@UseGuards(AuthGuard, BusinessProfileGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async create(
    @CurrentBusinessProfile() businessProfile: BusinessProfile,
    @Body(new ZodValidationPipe(createPaymentLinkSchema))
    createPaymentDto: CreatePaymentLinkDto,
  ): Promise<ApiResponse<PaymentLinkDto>> {
    const paymentLink = await this.paymentService.create(businessProfile, {
      ...createPaymentDto,
      source: 'dashboard',
    });
    return ApiResponseBuilder.success(
      PaymentLinkDto.transformToDTO(paymentLink),
      'Payment link created successfully',
    );
  }

  @Get()
  async findAll(
    @CurrentBusinessProfile() businessProfile: BusinessProfile,
    @Query(new ZodValidationPipe(paginationSchema)) query: PaginationQuery,
  ): Promise<ApiResponse<{ data: PaymentLinkDto[]; pagination: any }>> {
    const paginationMetadata = toPaginationMetadata(query);
    const { data, total } = await this.paymentService.findAllByBusinessProfile(
      businessProfile,
      query,
      paginationMetadata,
    );

    return ApiResponseBuilder.success(
      {
        data: data.map((link) => PaymentLinkDto.transformToDTO(link)),
        pagination: { ...paginationMetadata, total },
      },
      'Payment links retrieved successfully',
    );
  }

  @Put(':id/expire')
  async markExpired(
    @CurrentBusinessProfile() businessProfile: BusinessProfile,
    @Param('id') id: string,
  ): Promise<ApiResponse<PaymentLinkDto>> {
    const paymentLink = await this.paymentService.markExpired(
      businessProfile,
      id,
    );
    return ApiResponseBuilder.success(
      PaymentLinkDto.transformToDTO(paymentLink),
      'Payment link marked as expired',
    );
  }

  @Get(':id')
  async findOne(
    @CurrentBusinessProfile() businessProfile: BusinessProfile,
    @Param('id') id: string,
  ): Promise<ApiResponse<PaymentLinkDto>> {
    const paymentLink = await this.paymentService.findOne(businessProfile, id);
    return ApiResponseBuilder.success(
      PaymentLinkDto.transformToDTO(paymentLink),
      'Payment link retrieved successfully',
    );
  }
}
