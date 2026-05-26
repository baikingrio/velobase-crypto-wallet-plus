import { env } from "@/env";
import { createLogger } from "@/lib/logger";

const log = createLogger("crypto-prices");

const COINGECKO_IDS: Record<string, string> = {
  ETH: "ethereum",
  SOL: "solana",
  BTC: "bitcoin",
  USDC: "usd-coin",
  USDT: "tether",
};

export async function fetchTokenPricesUsd(
  symbols: string[],
): Promise<Record<string, number>> {
  const ids = symbols
    .map((s) => COINGECKO_IDS[s.toUpperCase()])
    .filter(Boolean);

  if (ids.length === 0) {
    return {};
  }

  try {
    const headers: HeadersInit = { Accept: "application/json" };
    if (env.COINGECKO_API_KEY) {
      headers["x-cg-pro-api-key"] = env.COINGECKO_API_KEY;
    }
    const base = env.COINGECKO_API_KEY
      ? "https://pro-api.coingecko.com"
      : "https://api.coingecko.com";

    const res = await fetch(
      `${base}/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd`,
      { headers, next: { revalidate: 60 } },
    );

    if (!res.ok) {
      log.warn({ status: res.status }, "CoinGecko price fetch failed");
      return getFallbackPrices(symbols);
    }

    const data = (await res.json()) as Record<string, { usd: number }>;
    const result: Record<string, number> = {};
    for (const [symbol, id] of Object.entries(COINGECKO_IDS)) {
      if (symbols.includes(symbol) && data[id]?.usd != null) {
        result[symbol] = data[id].usd;
      }
    }
    return { ...getFallbackPrices(symbols), ...result };
  } catch (err) {
    log.warn({ err }, "CoinGecko request error");
    return getFallbackPrices(symbols);
  }
}

function getFallbackPrices(symbols: string[]): Record<string, number> {
  const fallback: Record<string, number> = {
    ETH: 3200,
    SOL: 145,
    BTC: 95000,
    USDC: 1,
    USDT: 1,
  };
  return Object.fromEntries(
    symbols.map((s) => [s.toUpperCase(), fallback[s.toUpperCase()] ?? 0]),
  );
}
