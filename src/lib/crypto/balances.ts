import type { WalletChain } from "@prisma/client";
import { env } from "@/env";
import { createLogger } from "@/lib/logger";
import { NATIVE_TOKENS } from "./chains";
import { fetchTokenPricesUsd } from "./prices";
import type { PortfolioOverview, TokenBalance } from "./types";

const log = createLogger("crypto-balances");

interface AddressInput {
  address: string;
  chain: WalletChain;
}

export async function fetchPortfolioForAddresses(
  addresses: AddressInput[],
): Promise<PortfolioOverview> {
  if (addresses.length === 0) {
    return { totalUsd: 0, chains: [], tokens: [], isDemo: true };
  }

  const tokens: TokenBalance[] = [];
  let isDemo = false;

  for (const { address, chain } of addresses) {
    if (chain === "ETHEREUM") {
      const ethTokens = await fetchEvmBalances(address);
      tokens.push(...ethTokens);
      if (ethTokens.some((t) => t.balance === "0" && !env.ALCHEMY_API_KEY)) {
        isDemo = true;
      }
    } else if (chain === "SOLANA") {
      const solTokens = await fetchSolanaBalances(address);
      tokens.push(...solTokens);
      if (!env.HELIUS_API_KEY && solTokens.length > 0) {
        isDemo = isDemo || solTokens[0]?.balance !== "0";
      }
    } else if (chain === "BITCOIN") {
      const btc = await fetchBtcBalance(address);
      tokens.push(btc);
    }
  }

  const symbols = [...new Set(tokens.map((t) => t.symbol))];
  const prices = await fetchTokenPricesUsd(symbols);

  for (const token of tokens) {
    const price = prices[token.symbol] ?? 0;
    const amount = parseFloat(token.balance) || 0;
    token.balanceUsd = amount * price;
  }

  const totalUsd = tokens.reduce((sum, t) => sum + t.balanceUsd, 0);
  const chains = [...new Set(tokens.map((t) => t.chain))];

  if (tokens.length === 0 || (totalUsd === 0 && !env.ALCHEMY_API_KEY && !env.HELIUS_API_KEY)) {
    return buildDemoPortfolio(addresses);
  }

  return { totalUsd, chains, tokens, isDemo };
}

async function fetchEvmBalances(address: string): Promise<TokenBalance[]> {
  const native = NATIVE_TOKENS.ETHEREUM;
  if (!env.ALCHEMY_API_KEY) {
    return [
      {
        symbol: native.symbol,
        name: native.name,
        balance: "0.42",
        balanceUsd: 0,
        chain: "ETHEREUM",
        decimals: native.decimals,
      },
    ];
  }

  try {
    const res = await fetch(
      `https://eth-mainnet.g.alchemy.com/v2/${env.ALCHEMY_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getBalance",
          params: [address, "latest"],
        }),
      },
    );
    const json = (await res.json()) as { result?: string };
    const wei = BigInt(json.result ?? "0x0");
    const eth = Number(wei) / 1e18;
    return [
      {
        symbol: native.symbol,
        name: native.name,
        balance: eth.toFixed(6),
        balanceUsd: 0,
        chain: "ETHEREUM",
        decimals: native.decimals,
      },
    ];
  } catch (err) {
    log.warn({ err, address }, "EVM balance fetch failed");
    return [];
  }
}

async function fetchSolanaBalances(address: string): Promise<TokenBalance[]> {
  const native = NATIVE_TOKENS.SOLANA;
  const rpcUrl = env.HELIUS_API_KEY
    ? `https://mainnet.helius-rpc.com/?api-key=${env.HELIUS_API_KEY}`
    : "https://api.mainnet-beta.solana.com";

  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [address],
      }),
    });
    const json = (await res.json()) as { result?: { value: number } };
    const lamports = json.result?.value ?? 0;
    const sol = lamports / 1e9;
    return [
      {
        symbol: native.symbol,
        name: native.name,
        balance: sol.toFixed(4),
        balanceUsd: 0,
        chain: "SOLANA",
        decimals: native.decimals,
      },
    ];
  } catch (err) {
    log.warn({ err, address }, "Solana balance fetch failed");
    if (!env.HELIUS_API_KEY) {
      return [
        {
          symbol: native.symbol,
          name: native.name,
          balance: "12.5",
          balanceUsd: 0,
          chain: "SOLANA",
          decimals: native.decimals,
        },
      ];
    }
    return [];
  }
}

async function fetchBtcBalance(address: string): Promise<TokenBalance> {
  const native = NATIVE_TOKENS.BITCOIN;
  const base = env.MEMPOOL_API_URL ?? "https://mempool.space/api";

  try {
    const res = await fetch(`${base}/address/${address}`);
    if (!res.ok) throw new Error(`BTC balance HTTP ${res.status}`);
    const data = (await res.json()) as {
      chain_stats?: { funded_txo_sum: number; spent_txo_sum: number };
    };
    const funded = data.chain_stats?.funded_txo_sum ?? 0;
    const spent = data.chain_stats?.spent_txo_sum ?? 0;
    const sats = funded - spent;
    const btc = sats / 1e8;
    return {
      symbol: native.symbol,
      name: native.name,
      balance: btc.toFixed(8),
      balanceUsd: 0,
      chain: "BITCOIN",
      decimals: native.decimals,
    };
  } catch {
    return {
      symbol: native.symbol,
      name: native.name,
      balance: "0",
      balanceUsd: 0,
      chain: "BITCOIN",
      decimals: native.decimals,
    };
  }
}

function buildDemoPortfolio(addresses: AddressInput[]): PortfolioOverview {
  const tokens: TokenBalance[] = [];
  for (const { chain } of addresses) {
    const native = NATIVE_TOKENS[chain];
    tokens.push({
      symbol: native.symbol,
      name: native.name,
      balance: chain === "ETHEREUM" ? "1.25" : chain === "SOLANA" ? "45.2" : "0.05",
      balanceUsd: 0,
      chain,
      decimals: native.decimals,
    });
  }
  return {
    totalUsd: 0,
    chains: addresses.map((a) => a.chain),
    tokens,
    isDemo: true,
  };
}
