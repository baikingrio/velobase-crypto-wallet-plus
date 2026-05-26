import { env } from "@/env";
import { createLogger } from "@/lib/logger";
import type { SwapQuote } from "./types";

const log = createLogger("swap-oneinch");

const ETH_NATIVE = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export async function getOneInchQuote(input: {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  walletAddress: string;
  feeBps: number;
}): Promise<SwapQuote | null> {
  if (!env.ONEINCH_API_KEY) {
    return getMockEvmQuote(input);
  }

  const chainId = 1;
  const fromDecimals = input.fromToken === "ETH" ? 18 : 6;
  const amountWei = BigInt(
    Math.floor(parseFloat(input.fromAmount) * 10 ** fromDecimals),
  ).toString();

  const src = tokenToOneInchAddress(input.fromToken);
  const dst = tokenToOneInchAddress(input.toToken);

  try {
    const params = new URLSearchParams({
      src,
      dst,
      amount: amountWei,
      from: input.walletAddress,
      slippage: "1",
      fee: String(input.feeBps / 100),
    });

    const res = await fetch(
      `https://api.1inch.dev/swap/v6.0/${chainId}/quote?${params}`,
      {
        headers: {
          Authorization: `Bearer ${env.ONEINCH_API_KEY}`,
          Accept: "application/json",
        },
      },
    );

    if (!res.ok) {
      log.warn({ status: res.status }, "1inch quote failed");
      return getMockEvmQuote(input);
    }

    const data = (await res.json()) as {
      toAmount: string;
      dstAmount?: string;
    };

    const toDecimals = input.toToken === "ETH" ? 18 : 6;
    const toAmountRaw = data.toAmount ?? data.dstAmount ?? "0";
    const toAmount = (
      Number(BigInt(toAmountRaw)) /
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
      aggregator: "1inch",
      priceImpact: "< 0.5%",
    };
  } catch (err) {
    log.warn({ err }, "1inch request error");
    return getMockEvmQuote(input);
  }
}

function tokenToOneInchAddress(symbol: string): string {
  const upper = symbol.toUpperCase();
  if (upper === "ETH") return ETH_NATIVE;
  if (upper === "USDC") return "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  if (upper === "USDT") return "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  return ETH_NATIVE;
}

function getMockEvmQuote(input: {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  feeBps: number;
}): SwapQuote {
  const rate = input.fromToken === "ETH" ? 3200 : 1;
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
    aggregator: "1inch-mock",
    priceImpact: "~0.3%",
  };
}
