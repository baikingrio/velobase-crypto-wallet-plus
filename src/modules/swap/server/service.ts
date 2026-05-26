import type { WalletChain } from "@prisma/client";
import { SwapOrderStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { getOneInchQuote } from "@/lib/crypto/swap-oneinch";
import { getJupiterQuote } from "@/lib/crypto/swap-jupiter";
import type { SwapQuote } from "@/lib/crypto/types";
import { env } from "@/env";
import { createLogger } from "@/lib/logger";
import { db } from "@/server/db";

const logger = createLogger("swap-service");

function getFeeBps(): number {
  return env.SWAP_FEE_BPS ?? 30;
}

export async function getSwapQuote(
  userId: string,
  input: {
    chain: WalletChain;
    fromToken: string;
    toToken: string;
    fromAmount: string;
  },
): Promise<SwapQuote> {
  const connection = await db.walletConnection.findFirst({
    where: { userId, chain: input.chain },
    orderBy: { isPrimary: "desc" },
  });

  if (!connection) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Connect a wallet for this chain first",
    });
  }

  const feeBps = getFeeBps();

  if (input.chain === "ETHEREUM") {
    const quote = await getOneInchQuote({
      ...input,
      walletAddress: connection.address,
      feeBps,
    });
    if (!quote) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Quote failed" });
    }
    return quote;
  }

  if (input.chain === "SOLANA") {
    const quote = await getJupiterQuote({ ...input, feeBps });
    if (!quote) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Quote failed" });
    }
    return quote;
  }

  throw new TRPCError({
    code: "BAD_REQUEST",
    message: "Swaps not supported on this chain",
  });
}

export async function createSwapOrder(
  userId: string,
  input: {
    chain: WalletChain;
    fromToken: string;
    toToken: string;
    fromAmount: string;
  },
) {
  const quote = await getSwapQuote(userId, input);
  const feeBps = getFeeBps();

  return db.swapOrder.create({
    data: {
      userId,
      chain: input.chain,
      fromToken: input.fromToken,
      toToken: input.toToken,
      fromAmount: input.fromAmount,
      toAmount: quote.toAmount,
      feeAmount: quote.feeAmount,
      feeBps,
      aggregator: quote.aggregator,
      status: SwapOrderStatus.PENDING,
      quoteData: quote as object,
    },
  });
}

export async function confirmSwapOrder(
  userId: string,
  orderId: string,
  txHash: string,
  toAmount?: string,
) {
  const order = await db.swapOrder.findFirst({
    where: { id: orderId, userId },
  });
  if (!order) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
  }

  const updated = await db.swapOrder.update({
    where: { id: orderId },
    data: {
      txHash,
      toAmount: toAmount ?? order.toAmount,
      status: SwapOrderStatus.COMPLETED,
    },
  });

  if (order.feeAmount) {
    await db.platformRevenue.create({
      data: {
        type: "SWAP_FEE",
        sourceId: orderId,
        userId,
        amount: order.feeAmount,
        currency: order.fromToken,
        chain: order.chain,
      },
    });
  }

  logger.info({ orderId, userId }, "Swap order completed");
  return updated;
}

export async function listSwapOrders(
  userId: string,
  limit: number,
  cursor?: string,
) {
  const items = await db.swapOrder.findMany({
    where: { userId },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: { createdAt: "desc" },
  });

  let nextCursor: string | null = null;
  if (items.length > limit) {
    const next = items.pop();
    nextCursor = next?.id ?? null;
  }

  return { items, nextCursor };
}
