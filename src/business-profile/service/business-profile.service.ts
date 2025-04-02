import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusinessProfile } from '../schemas/business-profile.schema';
import * as crypto from 'crypto';
import { ApiKey } from '../schemas/api-key.schema';
import { Wallet } from '../schemas/wallet.schema';
import { ApiKeyService } from './api-key.service';

@Injectable()
export class BusinessProfileService {
  constructor(
    @InjectModel(BusinessProfile.name)
    private businessProfileModel: Model<BusinessProfile>,
    @InjectModel(ApiKey.name)
    private apiKeyModel: Model<ApiKey>,
    @InjectModel(Wallet.name)
    private walletModel: Model<Wallet>,
    private apiKeyService: ApiKeyService,
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

    const { keyValue, keyHash, encryptedKey } =
      this.apiKeyService.generateApiKey();

    if (!profile.api_key) {
      profile.api_key = new this.apiKeyModel({
        key_hash: keyHash,
        encrypted_key: encryptedKey,
        is_active: true,
        last_used_at: null,
      });
    }

    profile.api_key.key_hash = keyHash;
    profile.api_key.encrypted_key = encryptedKey;
    profile.api_key.is_active = true;
    profile.api_key.last_used_at = null;

    const savedProfile = await profile.save();
    return {
      profile: savedProfile,
      key_value: keyValue,
    };
  }

  async getBusinessProfileByApiKey(apiKey: string): Promise<BusinessProfile> {
    const keyHash = this.apiKeyService.hashApiKey(apiKey);
    const profile = await this.businessProfileModel.findOne({
      'api_key.key_hash': keyHash,
      'api_key.is_active': true,
    });

    if (!profile || !profile.api_key?.encrypted_key) {
      throw new NotFoundException('Business profile not found');
    }

    if (
      !this.apiKeyService.verifyApiKey(apiKey, profile.api_key.encrypted_key)
    ) {
      throw new NotFoundException('Business profile not found');
    }

    return profile;
  }
}
