import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusinessProfile } from '../schemas/business-profile.schema';
import * as crypto from 'crypto';
import { CheckoutCustomization } from '../schemas/checkout-customization.schema';
import { ApiKey } from '../schemas/api-key.schema';
import { Wallet } from '../schemas/wallet.schema';

@Injectable()
export class BusinessProfileService {
  constructor(
    @InjectModel(BusinessProfile.name)
    private businessProfileModel: Model<BusinessProfile>,
    @InjectModel(CheckoutCustomization.name)
    private checkoutCustomizationModel: Model<CheckoutCustomization>,
    @InjectModel(ApiKey.name)
    private apiKeyModel: Model<ApiKey>,
    @InjectModel(Wallet.name)
    private walletModel: Model<Wallet>,
  ) {}

  async createDefaultProfile(userId: string): Promise<BusinessProfile> {
    const profile = new this.businessProfileModel({
      user_id: userId,
      business_name: 'My Business',
      webhook_url: '',
      webhook_secret: crypto.randomBytes(32).toString('hex'),
      logo_url: '',
      business_description: '',
      contact_email: '',
      contact_phone: '',
      wallet: null,
      api_key: null,
      checkout_customization: null,
    });
    return await profile.save();
  }

  async getAllProfiles(userId: string): Promise<BusinessProfile[]> {
    const profiles = await this.businessProfileModel.find({ user_id: userId });
    if (!profiles || profiles.length === 0) {
      const profile = await this.createDefaultProfile(userId);
      return [profile];
    }
    return profiles;
  }

  async getProfileById(
    userId: string,
    profileId: string,
  ): Promise<BusinessProfile> {
    const profile = await this.businessProfileModel.findOne({
      _id: profileId,
      user_id: userId,
    });

    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }

    return profile;
  }

  async updateProfile(
    userId: string,
    profileId: string,
    updateData: Partial<BusinessProfile>,
  ): Promise<BusinessProfile> {
    const profile = await this.businessProfileModel.findOne({
      _id: profileId,
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

    type AllowedField = (typeof allowedFields)[number];

    allowedFields.forEach((field: AllowedField) => {
      const value = updateData[field];
      if (value !== undefined) {
        profile[field] = value;
      }
    });

    return await profile.save();
  }

  async updateWallet(
    userId: string,
    profileId: string,
    walletData: { wallet_address: string; wallet_type: string },
  ): Promise<BusinessProfile> {
    const profile = await this.businessProfileModel.findOne({
      _id: profileId,
      user_id: userId,
    });
    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }
    if (!profile.wallet) {
      profile.wallet = new this.walletModel({
        wallet_address: walletData.wallet_address,
        wallet_type: walletData.wallet_type,
        is_primary: true,
      });
    }
    profile.wallet.wallet_address = walletData.wallet_address;
    profile.wallet.wallet_type = walletData.wallet_type;
    return await profile.save();
  }

  async updateApiKey(
    userId: string,
    profileId: string,
  ): Promise<{ profile: BusinessProfile; key_value: string }> {
    const profile = await this.businessProfileModel.findOne({
      _id: profileId,
      user_id: userId,
    });
    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }

    const keyValue = crypto.randomBytes(32).toString('hex');
    const keyHash = crypto.createHash('sha256').update(keyValue).digest('hex');
    if (!profile.api_key) {
      profile.api_key = new this.apiKeyModel({
        key_hash: keyHash,
        is_active: true,
        last_used_at: null,
      });
    }
    profile.api_key.key_hash = keyHash;
    profile.api_key.is_active = true;
    profile.api_key.last_used_at = null;
    const savedProfile = await profile.save();
    return {
      profile: savedProfile,
      key_value: keyValue, // Return the actual key value for one-time display
    };
  }

  async deleteApiKey(
    userId: string,
    profileId: string,
  ): Promise<BusinessProfile> {
    const profile = await this.businessProfileModel.findOne({
      _id: profileId,
      user_id: userId,
    });
    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }

    profile.api_key = null;
    return await profile.save();
  }

  async updateCheckoutCustomization(
    userId: string,
    profileId: string,
    customization: Partial<CheckoutCustomization>,
  ): Promise<BusinessProfile> {
    const profile = await this.businessProfileModel.findOne({
      _id: profileId,
      user_id: userId,
    });
    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }

    if (!profile.checkout_customization) {
      profile.checkout_customization = new this.checkoutCustomizationModel({
        primary_color: '#000000',
        secondary_color: '#ffffff',
        logo_position: 'top right',
        background_image_url: 'some url',
        custom_css: 'some css',
      });
    }

    const allowedFields = [
      'primary_color',
      'secondary_color',
      'logo_position',
      'background_image_url',
      'custom_css',
    ] as const;

    allowedFields.forEach((field) => {
      const value = customization[field];
      if (value !== undefined) {
        profile.checkout_customization[field] = value;
      }
    });

    return await profile.save();
  }
}
