import { Inject, Injectable } from '@nestjs/common';
import * as ethers from 'ethers';
import { PaymentIntent } from '../entities/payment-intent.entity';
import { PaymentLink } from '../schemas/payment-link.schema';
import { ConfigType } from '@nestjs/config';
import web3Config from 'src/config/web3.config';

@Injectable()
export class Web3Service {
  constructor(
    @Inject(web3Config.KEY)
    private config: ConfigType<typeof web3Config>,
  ) {}
  async constructPaymentIntent(
    paymentLink: PaymentLink,
    sender: string,
  ): Promise<PaymentIntent> {
    let amount = BigInt(paymentLink.pricing.local.amount);
    if (paymentLink.pricing.local.asset.type === 'native') {
      amount = ethers.parseEther(amount.toString());
    } else if (paymentLink.pricing.local.asset.type === 'token') {
      amount = ethers.parseUnits(
        amount.toString(),
        paymentLink.pricing.local.asset.decimals,
      );
    }
    const intent: PaymentIntent = {
      recipient: paymentLink.business_profile_id.wallet!.wallet_address,
      recipientAmount: amount.toString(),
      recipientCurrency: paymentLink.pricing.local.asset.address,
      refundDestination: sender,
      feeAmount: '0',
      id: paymentLink.payment_id.replaceAll('-', ''),
      operator: this.config.operator_address,
      deadline: Math.floor(paymentLink.expired_at.getTime() / 1000),
      signature: '',
      prefix: '',
    };

    const signature = await this.signPaymentIntent(intent, sender);
    intent.signature = signature.signature;

    return intent;
  }

  private getPaymentIntentHash(intent: PaymentIntent, sender: string): string {
    const encodedData = ethers.solidityPacked(
      [
        'uint256',
        'uint256',
        'address',
        'address',
        'address',
        'uint256',
        'bytes16',
        'address',
        'uint256',
        'address',
        'address',
      ],
      [
        intent.recipientAmount,
        intent.deadline,
        intent.recipient,
        intent.recipientCurrency,
        intent.refundDestination,
        intent.feeAmount,
        '0x' + intent.id,
        intent.operator,
        this.config.pg_chain_id,
        sender,
        this.config.pg_contract_address,
      ],
    );

    return ethers.keccak256(encodedData);
  }
  private async signPaymentIntent(
    intent: PaymentIntent,
    sender: string,
  ): Promise<{
    signature: string;
    intent: PaymentIntent;
  }> {
    const hash = this.getPaymentIntentHash(intent, sender);
    const wallet = new ethers.Wallet(this.config.operator_private_key);
    const signature = await wallet.signMessage(ethers.getBytes(hash));

    return {
      signature,
      intent: {
        ...intent,
        signature,
      },
    };
  }
}
