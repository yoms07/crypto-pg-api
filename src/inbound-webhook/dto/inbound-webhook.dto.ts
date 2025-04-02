export interface AbiInput {
  indexed: boolean;
  name: string;
  type: string;
}

export interface AbiEvent {
  anonymous: boolean;
  inputs: AbiInput[];
  name: string;
  type: string;
}

export interface Block {
  number: string;
  hash: string;
  timestamp: string;
}

export interface Log {
  logIndex: string;
  transactionHash: string;
  address: string;
  data: string;
  topic0: string;
  topic1: string | null;
  topic2: string | null;
  topic3: string | null;
}

export interface NftApprovals {
  ERC1155: any[];
  ERC721: any[];
}

export interface MoralisWebhookEvent {
  confirmed: boolean;
  chainId: string;
  abi: AbiEvent[];
  streamId: string;
  tag: string;
  retries: number;
  block: Block;
  logs: Log[];
  txs: any[];
  txsInternal: any[];
  erc20Transfers: any[];
  erc20Approvals: any[];
  nftApprovals: NftApprovals;
  nftTransfers: any[];
}
