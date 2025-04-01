export interface PaymentIntent {
  recipientAmount: string; // BigNumber representation
  deadline: number; // Unix timestamp
  recipient: string; // Ethereum address
  recipientCurrency: string; // Token contract address
  refundDestination: string; // Ethereum address
  feeAmount: string; // BigNumber representation
  id: string; // 16 bytes identifier
  operator: string; // Ethereum address
  signature: string; // Hex string of signature
  prefix: string; // Hex string of prefix
}
