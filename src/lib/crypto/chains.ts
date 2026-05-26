import type { WalletChain } from "@prisma/client";

export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

export function isValidBtcAddress(address: string): boolean {
  return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);
}

export function validateAddressForChain(
  address: string,
  chain: WalletChain,
): boolean {
  switch (chain) {
    case "ETHEREUM":
      return isValidEvmAddress(address);
    case "SOLANA":
      return isValidSolanaAddress(address);
    case "BITCOIN":
      return isValidBtcAddress(address);
    default:
      return false;
  }
}

export const NATIVE_TOKENS: Record<
  WalletChain,
  { symbol: string; name: string; decimals: number }
> = {
  ETHEREUM: { symbol: "ETH", name: "Ethereum", decimals: 18 },
  SOLANA: { symbol: "SOL", name: "Solana", decimals: 9 },
  BITCOIN: { symbol: "BTC", name: "Bitcoin", decimals: 8 },
};
