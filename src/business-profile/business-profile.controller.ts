import {
  Controller,
  Get,
  Put,
  Post,
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
import { AddApiKeyDto, addApiKeyDto } from './dto/add-api-key.dto';
import { BusinessProfile } from './schemas/business-profile.schema';
import { Wallet } from './schemas/wallet.schema';
import { ApiKey } from './schemas/api-key.schema';

@Controller('business-profile')
@UseGuards(AuthGuard)
export class BusinessProfileController {
  constructor(
    private readonly businessProfileService: BusinessProfileService,
  ) {}

  @Get()
  async getProfile(
    @CurrentUser() user: User,
  ): Promise<ApiResponse<BusinessProfile>> {
    const profile = await this.businessProfileService.getBusinessProfile(
      user.id as string,
    );
    return ApiResponseBuilder.success(
      profile,
      'Business profile retrieved successfully',
    );
  }

  @Put()
  @UsePipes(new ZodValidationPipe(updateProfileDto))
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateData: UpdateProfileDto,
  ): Promise<ApiResponse<BusinessProfile>> {
    const profile = await this.businessProfileService.updateProfile(
      user.id as string,
      updateData,
    );
    return ApiResponseBuilder.success(
      profile,
      'Business profile updated successfully',
    );
  }

  @Put('wallet')
  @UsePipes(new ZodValidationPipe(updateWalletDto))
  async updateWallet(
    @CurrentUser() user: User,
    @Body() walletData: UpdateWalletDto,
  ): Promise<ApiResponse<Wallet>> {
    const wallet = await this.businessProfileService.updateWalletAddress(
      user.id as string,
      walletData,
    );
    return ApiResponseBuilder.success(wallet, 'Wallet updated successfully');
  }

  @Post('api-key')
  @UsePipes(new ZodValidationPipe(addApiKeyDto))
  async addApiKey(
    @CurrentUser() user: User,
    @Body() { name }: AddApiKeyDto,
  ): Promise<ApiResponse<ApiKey>> {
    const apiKey = await this.businessProfileService.addApiKey(
      user.id as string,
      name,
    );
    return ApiResponseBuilder.success(apiKey, 'API key created successfully');
  }

  @Delete('api-key/:keyId')
  async deleteApiKey(
    @CurrentUser() user: User,
    @Param('keyId') keyId: string,
  ): Promise<ApiResponse<{ success: boolean }>> {
    const success = await this.businessProfileService.deleteApiKey(
      user.id as string,
      keyId,
    );
    return ApiResponseBuilder.success(
      { success },
      'API key deleted successfully',
    );
  }
}
