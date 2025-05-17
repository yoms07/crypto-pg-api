import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Post,
} from '@nestjs/common';
import { BusinessProfileService } from './service/business-profile.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/schemas/user.schema';
import { ApiResponse, ApiResponseBuilder } from '../common/response.common';
import { ZodValidationPipe } from '../zod-validation';
import { UpdateProfileDto, updateProfileDto } from './dto/update-profile.dto';
import { UpdateWalletDto, updateWalletDto } from './dto/update-wallet.dto';
import { BusinessProfile } from './schemas/business-profile.schema';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { BusinessProfileDto } from './dto/business-profile.dto';
import { ApiKeyService } from './service/api-key.service';
import { CreateProfileDto, createProfileDto } from './dto/create-profile.dto';
import {
  UpdateCheckoutCustomizationDto,
  updateCheckoutCustomizationDto,
} from './dto/update-checkout-customization.dto';

@Controller('business-profile')
@UseGuards(AuthGuard)
export class BusinessProfileController {
  constructor(
    private readonly businessProfileService: BusinessProfileService,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  private transformToDto(profile: BusinessProfile): BusinessProfileDto {
    return {
      id: profile.id as string,
      user_id: profile.user_id._id as string,
      business_name: profile.business_name,
      webhook_url: profile.webhook_url,
      webhook_secret: profile.webhook_secret,
      logo_url: profile.logo_url,
      business_description: profile.business_description,
      contact_email: profile.contact_email,
      contact_phone: profile.contact_phone,
      wallet: profile.wallet,
      api_key: profile.api_key
        ? {
            is_active: profile.api_key.is_active,
            last_used_at: profile.api_key.last_used_at,
            api_key: this.apiKeyService.decryptApiKey(
              profile.api_key.encrypted_key,
            ),
          }
        : null,
      checkout_customization: profile.checkout_customization,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };
  }

  @Get()
  async getAllProfiles(
    @CurrentUser() user: User,
  ): Promise<ApiResponse<BusinessProfileDto[]>> {
    const profiles = await this.businessProfileService.getAllProfiles(
      user.id as string,
    );
    return ApiResponseBuilder.success(
      profiles.map((profile) => this.transformToDto(profile)),
      'Business profiles retrieved successfully',
    );
  }

  @Get(':id')
  async getProfileById(
    @CurrentUser() user: User,
    @Param('id', ParseObjectIdPipe) profileId: string,
  ): Promise<ApiResponse<BusinessProfileDto>> {
    const profile = await this.businessProfileService.getProfileById(
      user.id as string,
      profileId,
    );
    return ApiResponseBuilder.success(
      this.transformToDto(profile),
      'Business profile retrieved successfully',
    );
  }

  @Put(':id/api-key')
  async updateApiKey(
    @CurrentUser() user: User,
    @Param('id') profileId: string,
  ): Promise<ApiResponse<BusinessProfileDto>> {
    const result = await this.businessProfileService.updateApiKey(
      user.id as string,
      profileId,
    );
    const dto = this.transformToDto(result.profile);
    dto.api_key!.api_key = result.key_value; // Include plain API key only when generated
    return ApiResponseBuilder.success(dto, 'API key updated successfully');
  }

  @Put(':id')
  async updateProfile(
    @CurrentUser() user: User,
    @Param('id') profileId: string,
    @Body(new ZodValidationPipe(updateProfileDto)) updateData: UpdateProfileDto,
  ): Promise<ApiResponse<BusinessProfile>> {
    const profile = await this.businessProfileService.updateProfile(
      user.id as string,
      profileId,
      updateData,
    );
    return ApiResponseBuilder.success(
      profile,
      'Business profile updated successfully',
    );
  }

  @Put(':id/wallet')
  async updateWallet(
    @CurrentUser() user: User,
    @Param('id', ParseObjectIdPipe) profileId: string,
    @Body(new ZodValidationPipe(updateWalletDto)) walletData: UpdateWalletDto,
  ): Promise<ApiResponse<BusinessProfileDto>> {
    const profile = await this.businessProfileService.updateWallet(
      user.id as string,
      profileId,
      walletData,
    );
    return ApiResponseBuilder.success(
      this.transformToDto(profile),
      'Wallet updated successfully',
    );
  }

  @Put(':id/webhook')
  async updateWebhook(
    @CurrentUser() user: User,
    @Param('id', ParseObjectIdPipe) profileId: string,
    @Body('webhook_url') webhookUrl: string,
  ): Promise<ApiResponse<BusinessProfileDto>> {
    const profile = await this.businessProfileService.updateWebhook(
      user.id as string,
      profileId,
      webhookUrl,
    );
    return ApiResponseBuilder.success(
      this.transformToDto(profile),
      'Webhook configuration updated successfully',
    );
  }

  @Put(':id/checkout-customization')
  async updateCheckoutCustomization(
    @CurrentUser() user: User,
    @Param('id', ParseObjectIdPipe) profileId: string,
    @Body(new ZodValidationPipe(updateCheckoutCustomizationDto))
    customizationData: UpdateCheckoutCustomizationDto,
  ): Promise<ApiResponse<BusinessProfileDto>> {
    console.log(customizationData);
    const profile =
      await this.businessProfileService.updateCheckoutCustomization(
        user.id as string,
        profileId,
        customizationData,
      );
    return ApiResponseBuilder.success(
      this.transformToDto(profile),
      'Checkout customization updated successfully',
    );
  }

  @Post()
  async createProfile(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(createProfileDto)) createData: CreateProfileDto,
  ): Promise<ApiResponse<BusinessProfileDto>> {
    const profile = await this.businessProfileService.createBusinessProfile(
      user.id as string,
      createData,
    );
    return ApiResponseBuilder.success(
      this.transformToDto(profile),
      'Business profile created successfully',
    );
  }
}
