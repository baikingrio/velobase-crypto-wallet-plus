import { WalletChain } from "@prisma/client";
import { z } from "zod";

export const listProductsSchema = z.object({
  chain: z.nativeEnum(WalletChain).optional(),
  limit: z.number().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export const getProductSchema = z.object({
  productId: z.string().cuid(),
});

export const openPositionSchema = z.object({
  productId: z.string().cuid(),
  depositedAmount: z.string().regex(/^\d+(\.\d+)?$/),
});

export const listPositionsSchema = z.object({
  limit: z.number().min(1).max(50).default(20),
  cursor: z.string().optional(),
});
