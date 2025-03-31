import {
  Controller,
  Get,
  Put,
  Delete,
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

@Controller('business-profile')
@UseGuards(AuthGuard)
export class BusinessProfileController {
  constructor(
    private readonly businessProfileService: BusinessProfileService,
  ) {}

  @Get()
  async getAllProfiles(
    @CurrentUser() user: User,
  ): Promise<ApiResponse<BusinessProfile[]>> {
    const profiles = await this.businessProfileService.getAllProfiles(
      user.id as string,
    );
    return ApiResponseBuilder.success(
      profiles,
      'Business profiles retrieved successfully',
    );
  }

  @Get(':id')
  async getProfileById(
    @CurrentUser() user: User,
    @Param('id', ParseObjectIdPipe) profileId: string,
  ): Promise<ApiResponse<BusinessProfile>> {
    const profile = await this.businessProfileService.getProfileById(
      user.id as string,
      profileId,
    );
    return ApiResponseBuilder.success(
      profile,
      'Business profile retrieved successfully',
    );
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

  @Put(':id/api-key')
  async updateApiKey(
    @CurrentUser() user: User,
    @Param('id') profileId: string,
  ): Promise<ApiResponse<{ profile: BusinessProfile; key_value: string }>> {
    const result = await this.businessProfileService.updateApiKey(
      user.id as string,
      profileId,
    );
    return ApiResponseBuilder.success(result, 'API key updated successfully');
  }

  @Delete(':id/api-key')
  async deleteApiKey(
    @CurrentUser() user: User,
    @Param('id') profileId: string,
  ): Promise<ApiResponse<BusinessProfile>> {
    const profile = await this.businessProfileService.deleteApiKey(
      user.id as string,
      profileId,
    );
    return ApiResponseBuilder.success(profile, 'API key deleted successfully');
  }
}
