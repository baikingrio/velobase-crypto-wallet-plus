import type { WalletChain } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";

export async function listEarnProducts(
  chain: WalletChain | undefined,
  limit: number,
  cursor?: string,
) {
  const items = await db.earnProduct.findMany({
    where: {
      isActive: true,
      ...(chain ? { chain } : {}),
    },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: { apy: "desc" },
  });

  let nextCursor: string | null = null;
  if (items.length > limit) {
    const next = items.pop();
    nextCursor = next?.id ?? null;
  }

  return { items, nextCursor };
}

export async function getEarnProduct(productId: string) {
  const product = await db.earnProduct.findFirst({
    where: { id: productId, isActive: true },
  });
  if (!product) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
  }
  return product;
}

export async function listEarnPositions(
  userId: string,
  limit: number,
  cursor?: string,
) {
  const items = await db.earnPosition.findMany({
    where: { userId, status: "ACTIVE" },
    include: { product: true },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: { openedAt: "desc" },
  });

  let nextCursor: string | null = null;
  if (items.length > limit) {
    const next = items.pop();
    nextCursor = next?.id ?? null;
  }

  return { items, nextCursor };
}

export async function openEarnPosition(
  userId: string,
  productId: string,
  depositedAmount: string,
) {
  const product = await getEarnProduct(productId);

  return db.earnPosition.create({
    data: {
      userId,
      productId: product.id,
      depositedAmount,
      currentValue: depositedAmount,
    },
    include: { product: true },
  });
}
