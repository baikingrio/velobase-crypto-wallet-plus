import { env } from "@/env";
import { createLogger } from "@/lib/logger";
import type { SwapQuote } from "./types";

const log = createLogger("swap-jupiter");

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export async function getJupiterQuote(input: {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  feeBps: number;
}): Promise<SwapQuote | null> {
  const fromMint = tokenToMint(input.fromToken);
  const toMint = tokenToMint(input.toToken);
  const fromDecimals = input.fromToken === "SOL" ? 9 : 6;
  const amount = Math.floor(
    parseFloat(input.fromAmount) * 10 ** fromDecimals,
  ).toString();

  const baseUrl = env.JUPITER_API_URL ?? "https://quote-api.jup.ag/v6";

  try {
    const params = new URLSearchParams({
      inputMint: fromMint,
      outputMint: toMint,
      amount,
      slippageBps: "100",
    });

    const res = await fetch(`${baseUrl}/quote?${params}`);
    if (!res.ok) {
      log.warn({ status: res.status }, "Jupiter quote failed");
      return getMockSolQuote(input);
    }

    const data = (await res.json()) as {
      outAmount: string;
      priceImpactPct?: string;
    };

    const toDecimals = input.toToken === "SOL" ? 9 : 6;
    const toAmount = (
      Number(data.outAmount) /
      10 ** toDecimals
    ).toFixed(6);

    const feeAmount = (
      (parseFloat(input.fromAmount) * input.feeBps) /
      10000
    ).toFixed(6);

    return {
      fromToken: input.fromToken,
      toToken: input.toToken,
      fromAmount: input.fromAmount,
      toAmount,
      feeAmount,
      feeBps: input.feeBps,
      aggregator: "jupiter",
      priceImpact: data.priceImpactPct
        ? `${data.priceImpactPct}%`
        : undefined,
    };
  } catch (err) {
    log.warn({ err }, "Jupiter request error");
    return getMockSolQuote(input);
  }
}

function tokenToMint(symbol: string): string {
  const upper = symbol.toUpperCase();
  if (upper === "SOL") return SOL_MINT;
  if (upper === "USDC") return USDC_MINT;
  return SOL_MINT;
}

function getMockSolQuote(input: {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  feeBps: number;
}): SwapQuote {
  const rate = input.fromToken === "SOL" ? 145 : 1;
  const toAmount = (parseFloat(input.fromAmount) * rate).toFixed(4);
  const feeAmount = (
    (parseFloat(input.fromAmount) * input.feeBps) /
    10000
  ).toFixed(6);

  return {
    fromToken: input.fromToken,
    toToken: input.toToken,
    fromAmount: input.fromAmount,
    toAmount,
    feeAmount,
    feeBps: input.feeBps,
    aggregator: "jupiter-mock",
    priceImpact: "~0.2%",
  };
}
