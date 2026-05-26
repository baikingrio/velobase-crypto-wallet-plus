import { WalletChain } from "@prisma/client";
import { z } from "zod";

export const getQuoteSchema = z.object({
  chain: z.nativeEnum(WalletChain),
  fromToken: z.string().min(1),
  toToken: z.string().min(1),
  fromAmount: z.string().regex(/^\d+(\.\d+)?$/),
});

export const createOrderSchema = getQuoteSchema;

export const confirmOrderSchema = z.object({
  orderId: z.string().cuid(),
  txHash: z.string().min(1),
  toAmount: z.string().optional(),
});

export const listOrdersSchema = z.object({
  limit: z.number().min(1).max(50).default(20),
  cursor: z.string().optional(),
});
