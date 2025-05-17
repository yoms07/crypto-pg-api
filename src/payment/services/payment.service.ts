import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePaymentLinkDto } from '../dto/create-payment.dto';
import { PaginationMetadata } from '@/common/pagination.common';
import { PaymentLink } from '../schemas/payment-link.schema';
import { BusinessProfile } from '@/business-profile/schemas/business-profile.schema';
import { Web3Service } from './web3.service';
import { v4 as uuidv4 } from 'uuid';
import { PaymentIntent } from '../entities/payment-intent.entity';
import { formatUUID } from '@/utils/uuid';
import { OutboundWebhookService } from '@/outbound-webhook/outbound-webhook.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name, {
    timestamp: true,
  });
  constructor(
    @InjectModel(PaymentLink.name)
    private paymentLinkModel: Model<PaymentLink>,
    private web3Service: Web3Service,
    private outboundWebhookService: OutboundWebhookService,
  ) {}

  private genenratePaymentId(): string {
    // Generate a random 6-digit number
    return uuidv4();
  }

  async create(
    businessProfile: BusinessProfile,
    createPaymentLinkDto: CreatePaymentLinkDto,
  ): Promise<PaymentLink> {
    // Check for unique external_id
    const existingPayment = await this.paymentLinkModel.findOne({
      business_profile_id: businessProfile._id,
      external_id: createPaymentLinkDto.external_id,
    });

    if (existingPayment) {
      throw new BadRequestException(
        'External ID must be unique for this business profile',
      );
    }

    // Validate URLs if provided
    if (createPaymentLinkDto.success_redirect_url) {
      try {
        new URL(createPaymentLinkDto.success_redirect_url);
      } catch (e) {
        this.logger.error('Invalid success redirect URL', e);
        throw new BadRequestException('Invalid success redirect URL');
      }
    }

    if (createPaymentLinkDto.failure_redirect_url) {
      try {
        new URL(createPaymentLinkDto.failure_redirect_url);
      } catch (e) {
        this.logger.error('Invalid failure redirect URL', e);
        throw new BadRequestException('Invalid failure redirect URL');
      }
    }

    // Validate metadata if provided
    if (createPaymentLinkDto.metadata) {
      try {
        const metadataStr = JSON.stringify(createPaymentLinkDto.metadata);
        if (metadataStr.length > 500) {
          throw new BadRequestException(
            'Metadata length exceeds 500 characters',
          );
        }
      } catch (e) {
        this.logger.error('Invalid metadata format', e);
        throw new BadRequestException('Invalid metadata format');
      }
    }

    // Set expiration time (24 hours from now)
    const expired_at = new Date();
    expired_at.setHours(expired_at.getHours() + 24);

    // Create payment link
    const paymentLink = new this.paymentLinkModel({
      ...createPaymentLinkDto,
      business_profile_id: businessProfile._id,
      payment_id: this.genenratePaymentId(),
      status: 'pending',
      expired_at,
      pricing: {
        local: {
          amount: createPaymentLinkDto.pricing.amount,
          currency: createPaymentLinkDto.pricing.currency,
          asset: {
            address: '0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22',
            chainId: 1135,
            decimals: 2,
            type: 'token',
          },
        },
      },
      support_email: businessProfile.contact_email,
      blockchain_data: {
        transfer_intent: {},
        success_event: null,
        failure_event: null,
      },
      items: createPaymentLinkDto.items || [],
    });

    this.logger.debug('Creating payment link with data:', paymentLink); // Add debug log
    const saved = await paymentLink.save();
    this.logger.debug('Saved payment link:', saved); // Add debug log
    return saved;
  }

  async initiatePayment(
    businessProfile: BusinessProfile,
    paymentId: string,
    sender: string,
  ): Promise<PaymentIntent> {
    const paymentLink = await this.paymentLinkModel
      .findOne({
        business_profile_id: businessProfile._id,
        payment_id: paymentId,
      })
      .populate({
        path: 'business_profile_id',
        select:
          'checkout_customization _id business_name logo_url business_description contact_email contact_phone wallet',
      });
    console.log(paymentLink);

    if (!paymentLink) {
      throw new NotFoundException('Payment link not found');
    }
    if (
      paymentLink.status !== 'pending' &&
      paymentLink.status !== 'processing'
    ) {
      throw new BadRequestException(
        'Payment link is not in pending/processing status',
      );
    }
    if (
      paymentLink.blockchain_data.transfer_intent &&
      sender in paymentLink.blockchain_data.transfer_intent
    ) {
      const paymentIntent = paymentLink.blockchain_data.transfer_intent[sender];
      if (paymentIntent && paymentIntent.deadline > Date.now() / 1000) {
        return paymentIntent;
      }
    }

    // Construct payment intent
    const paymentIntentData = await this.web3Service.constructPaymentIntent(
      paymentLink,
      sender,
    );
    paymentLink.blockchain_data.transfer_intent[sender] = paymentIntentData;
    paymentLink.status = 'processing';
    await paymentLink.save();
    return paymentIntentData;
  }

  async findAllByBusinessProfile(
    businessProfile: BusinessProfile,
    query: any,
    paginationMetadata: PaginationMetadata,
  ): Promise<{ data: PaymentLink[]; total: number }> {
    const { currentPage: page, itemsPerPage: limit } = paginationMetadata;
    const skip = (page - 1) * limit;

    const filter = {
      business_profile_id: businessProfile.id as string,
      // ...(query.status && { status: query.status }),
    };

    const [data, total] = await Promise.all([
      this.paymentLinkModel
        .find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.paymentLinkModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  async findByExternalId(
    businessProfile: BusinessProfile,
    externalId: string,
  ): Promise<PaymentLink> {
    const paymentLink = await this.paymentLinkModel.findOne({
      business_profile_id: businessProfile.id,
      external_id: externalId,
    });

    if (!paymentLink) {
      throw new NotFoundException('Payment link not found');
    }

    return paymentLink;
  }

  async findOne(
    businessProfile: BusinessProfile,
    id: string,
  ): Promise<PaymentLink> {
    const paymentLink = await this.paymentLinkModel.findOne({
      payment_id: id,
      business_profile_id: businessProfile.id,
    });

    if (!paymentLink) {
      throw new NotFoundException('Payment link not found');
    }

    return paymentLink;
  }

  async markExpired(
    businessProfile: BusinessProfile,
    id: string,
  ): Promise<PaymentLink> {
    const paymentLink = await this.paymentLinkModel.findOne({
      _id: id,
      business_profile_id: businessProfile.id,
    });
    if (!paymentLink) {
      throw new NotFoundException('Payment link not found');
    }

    if (paymentLink.status !== 'pending') {
      throw new BadRequestException('Payment link is not in pending status');
    }

    paymentLink.status = 'expired';
    paymentLink.expired_at = new Date();

    return await paymentLink.save();
  }

  async markPaid(paymentIntent: PaymentIntent): Promise<void> {
    const id = formatUUID(paymentIntent.id);
    const paymentLink = await this.paymentLinkModel
      .findOne({ payment_id: id })
      .populate('business_profile_id');
    if (!paymentLink) {
      throw new NotFoundException('Payment link not found');
    }

    if (paymentLink.status !== 'processing') {
      throw new BadRequestException('Payment link is not in processing status');
    }

    paymentLink.status = 'completed';
    paymentLink.success_at = new Date();
    paymentLink.blockchain_data.success_event = paymentIntent;

    await paymentLink.save();

    // Send webhook
    this.outboundWebhookService
      .sendPaymentSuccessWebhook(
        paymentLink.business_profile_id,
        paymentLink,
        paymentIntent.signature,
      )
      .then(() => {})
      .catch(() => {});
  }

  async markFailed(paymentIntent: PaymentIntent): Promise<void> {
    const id = formatUUID(paymentIntent.id);
    const paymentLink = await this.paymentLinkModel
      .findOne({ payment_id: id })
      .populate('business_profile_id');
    if (!paymentLink) {
      throw new NotFoundException('Payment link not found');
    }

    if (paymentLink.status !== 'processing') {
      throw new BadRequestException('Payment link is not in processing status');
    }

    paymentLink.status = 'failed';
    paymentLink.failed_at = new Date();
    paymentLink.blockchain_data.failure_event = paymentIntent;

    await paymentLink.save();

    // Send webhook
    this.outboundWebhookService
      .sendPaymentFailedWebhook(
        paymentLink.business_profile_id,
        paymentLink,
        'Transaction failed',
      )
      .then(() => {})
      .catch(() => {});
  }

  async findOnePublic(id: string): Promise<PaymentLink> {
    const paymentLink = await this.paymentLinkModel
      .findOne({ payment_id: id })
      .populate({
        path: 'business_profile_id',
        select:
          'checkout_customization _id business_name logo_url business_description contact_email contact_phone',
      });

    if (!paymentLink) {
      throw new NotFoundException('Payment link not found');
    }

    return paymentLink;
  }
}
