import type { WalletChain } from "@prisma/client";

export type { WalletChain };

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  balanceUsd: number;
  chain: WalletChain;
  contractAddress?: string;
  decimals: number;
}

export interface PortfolioOverview {
  totalUsd: number;
  chains: WalletChain[];
  tokens: TokenBalance[];
  isDemo: boolean;
}

export interface SwapQuote {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  feeAmount: string;
  feeBps: number;
  priceImpact?: string;
  aggregator: string;
  txData?: Record<string, unknown>;
}
