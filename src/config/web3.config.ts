import { registerAs } from '@nestjs/config';

export interface Web3Config {
  operator_private_key: string;
  operator_address: string;
  pg_contract_address: string;
  pg_chain_id: number;
}

export default registerAs(
  'web3',
  (): Web3Config => ({
    operator_private_key: process.env.WEB3_OPERATOR_PRIVATE_KEY || '0x',
    operator_address: process.env.WEB3_OPERATOR_ADDRESS || '0x',
    pg_contract_address: process.env.WEB3_PG_CONTRACT_ADDRESS || '0x',
    pg_chain_id: parseInt(process.env.WEB3_PG_CHAIN_ID || '1'),
  }),
);
