import { Injectable } from '@nestjs/common';
import * as ethers from 'ethers';
import { PaymentIntent } from '../entities/payment-intent.entity';
import { PaymentLink } from '../schemas/payment-link.schema';

@Injectable()
export class Web3Service {
  private contractAddress = '0x';
  private signerAddress = '0x';
  private signerPrivateKey = '0x';
  private chainId = 1;
  constructPaymentIntent(
    paymentLink: PaymentLink,
    sender: string,
  ): PaymentIntent {
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
      operator: this.signerAddress,
      deadline: paymentLink.expired_at.getTime() / 1000,
      signature: '',
      prefix: '',
    };

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
        intent.id,
        intent.operator,
        this.chainId,
        sender,
        this.contractAddress,
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
    const wallet = new ethers.Wallet(this.signerPrivateKey);
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
