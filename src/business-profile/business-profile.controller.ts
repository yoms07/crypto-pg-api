import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  UsePipes,
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

@Controller('business-profile')
@UseGuards(AuthGuard)
export class BusinessProfileController {
  constructor(
    private readonly businessProfileService: BusinessProfileService,
  ) {}

  private transformToDto(profile: BusinessProfile): BusinessProfileDto {
    return {
      id: profile.id as string,
      user_id: profile.user_id.id as string,
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
  @UsePipes(new ZodValidationPipe(updateProfileDto))
  async updateProfile(
    @CurrentUser() user: User,
    @Param('id') profileId: string,
    @Body() updateData: UpdateProfileDto,
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
  @UsePipes(new ZodValidationPipe(updateWalletDto))
  async updateWallet(
    @CurrentUser() user: User,
    @Param('id') profileId: string,
    @Body() walletData: UpdateWalletDto,
  ): Promise<ApiResponse<BusinessProfile>> {
    const profile = await this.businessProfileService.updateWallet(
      user.id as string,
      profileId,
      walletData,
    );
    return ApiResponseBuilder.success(profile, 'Wallet updated successfully');
  }
}
