import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusinessProfile } from '../schemas/business-profile.schema';
import { Wallet } from '../schemas/wallet.schema';
import * as crypto from 'crypto';
import { CheckoutCustomization } from '../schemas/checkout-customization.schema';
import { ApiKey } from '../schemas/api-key.schema';

@Injectable()
export class BusinessProfileService {
  constructor(
    @InjectModel(BusinessProfile.name)
    private businessProfileModel: Model<BusinessProfile>,
    @InjectModel(ApiKey.name)
    private apiKeyModel: Model<ApiKey>,
    @InjectModel(Wallet.name)
    private walletModel: Model<Wallet>,
    @InjectModel(CheckoutCustomization.name)
    private checkoutCustomizationModel: Model<CheckoutCustomization>,
  ) {}

  async getBusinessProfile(userId: string): Promise<BusinessProfile> {
    let profile = await this.businessProfileModel
      .findOne({ user_id: userId })
      .populate('api_keys')
      .populate('wallets');

    if (!profile) {
      profile = new this.businessProfileModel({
        user_id: userId,
        business_name: 'My Business',
        webhook_url: '',
        webhook_secret: crypto.randomBytes(32).toString('hex'),
      });
      await profile.save();
    }

    if (!profile.checkout_customization) {
      const defaultCustomization = new this.checkoutCustomizationModel({
        business_id: profile._id,
        primary_color: '#0066FF',
        secondary_color: '#FFFFFF',
        logo_position: 'center',
        background_image_url: '',
        custom_css: '',
      });
      profile.checkout_customization = defaultCustomization;
      await profile.save();
    }

    return profile;
  }

  async updateProfile(
    userId: string,
    updateData: Partial<BusinessProfile>,
  ): Promise<BusinessProfile> {
    const profile = await this.businessProfileModel.findOne({
      user_id: userId,
    });
    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }

    const allowedFields = [
      'business_name',
      'webhook_url',
      'business_description',
      'contact_email',
      'contact_phone',
      'logo_url',
    ] as const;

    allowedFields.forEach((field) => {
      if (field in updateData) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        profile[field] = updateData[field as keyof typeof updateData];
      }
    });

    return await profile.save();
  }

  async updateWalletAddress(
    userId: string,
    walletData: { address: string; type: string },
  ): Promise<Wallet> {
    const profile = await this.businessProfileModel.findOne({
      user_id: userId,
    });
    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }

    const wallet = new this.walletModel({
      business_id: profile._id,
      wallet_address: walletData.address,
      wallet_type: walletData.type,
      is_primary: true,
    });

    // Set all other wallets as non-primary
    await this.walletModel.updateMany(
      { business_id: profile._id },
      { is_primary: false },
    );

    return await wallet.save();
  }

  async addApiKey(userId: string, keyName: string): Promise<ApiKey> {
    const profile = await this.businessProfileModel.findOne({
      user_id: userId,
    });
    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }

    const keyValue = crypto.randomBytes(32).toString('hex');
    const keyHash = crypto.createHash('sha256').update(keyValue).digest('hex');

    const apiKey = new this.apiKeyModel({
      business_id: profile._id,
      key_hash: keyHash,
      name: keyName,
      is_active: true,
    });

    const savedKey = await apiKey.save();
    return savedKey;
  }

  async deleteApiKey(userId: string, keyId: string): Promise<boolean> {
    const profile = await this.businessProfileModel.findOne({
      user_id: userId,
    });
    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }

    const result = await this.apiKeyModel.deleteOne({
      _id: keyId,
      business_id: profile._id,
    });

    return result.deletedCount > 0;
  }

  async updateCheckoutCustomization(
    userId: string,
    customizationData: Partial<CheckoutCustomization>,
  ): Promise<BusinessProfile> {
    const profile = await this.businessProfileModel.findOne({
      user_id: userId,
    });
    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }

    let customization = await this.checkoutCustomizationModel.findOne({
      business_id: profile._id,
    });

    if (!customization) {
      customization = new this.checkoutCustomizationModel({
        business_id: profile._id,
        primary_color: '#0066FF',
        secondary_color: '#FFFFFF',
        logo_position: 'center',
        background_image_url: '',
        custom_css: '',
      });
    }

    // Update only provided fields
    Object.assign(customization, customizationData);

    // Update profile reference
    profile.checkout_customization = customization;
    return await profile.save();
  }

  async getCheckoutCustomization(userId: string): Promise<BusinessProfile> {
    const profile = await this.businessProfileModel.findOne({
      user_id: userId,
    });

    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }

    if (!profile.checkout_customization) {
      const defaultCustomization = new this.checkoutCustomizationModel({
        business_id: profile._id,
        primary_color: '#0066FF',
        secondary_color: '#FFFFFF',
        logo_position: 'center',
        background_image_url: '',
        custom_css: '',
      });

      profile.checkout_customization = defaultCustomization;
      await profile.save();

      return profile;
    }

    return profile;
  }
}
