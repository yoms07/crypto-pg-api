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
import { ValidApiKeyGuard } from '@/business-profile/guards/api-key.guard';
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
import { PaymentLinkDto } from '../dto/payment-link.dto';

@Controller('/api/payment')
@UseGuards(ValidApiKeyGuard)
export class PaymentApiController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async create(
    @CurrentBusinessProfile() businessProfile: BusinessProfile,
    @Body(new ZodValidationPipe(createPaymentLinkSchema))
    createPaymentDto: CreatePaymentLinkDto,
  ): Promise<ApiResponse<any>> {
    const paymentLink = await this.paymentService.create(businessProfile, {
      ...createPaymentDto,
      source: 'api',
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
  ): Promise<ApiResponse<any>> {
    const paginationMetadata = toPaginationMetadata(query);
    const { data, total } = await this.paymentService.findAllByBusinessProfile(
      businessProfile,
      query,
      paginationMetadata,
    );
    const paginationResult = toPaginationMetadata(query, total);

    return ApiResponseBuilder.success(
      {
        data: data.map((payment) => PaymentLinkDto.transformToDTO(payment)),
        pagination: { ...paginationResult, total },
      },
      'Payment links retrieved successfully',
    );
  }

  @Put(':id/expire')
  async markExpired(
    @CurrentBusinessProfile() businessProfile: BusinessProfile,
    @Param('id') id: string,
  ): Promise<ApiResponse<any>> {
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
  ): Promise<ApiResponse<any>> {
    const paymentLink = await this.paymentService.findOne(businessProfile, id);
    return ApiResponseBuilder.success(
      PaymentLinkDto.transformToDTO(paymentLink),
      'Payment link retrieved successfully',
    );
  }

  @Get('external/:externalId')
  async findByExternalId(
    @CurrentBusinessProfile() businessProfile: BusinessProfile,
    @Param('externalId') externalId: string,
  ): Promise<ApiResponse<any>> {
    const paymentLink = await this.paymentService.findByExternalId(
      businessProfile,
      externalId,
    );
    return ApiResponseBuilder.success(
      PaymentLinkDto.transformToDTO(paymentLink),
      'Payment link retrieved successfully',
    );
  }
}
