import type { DAppCategory } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";

export async function listDApps(
  category: DAppCategory | undefined,
  limit: number,
  cursor?: string,
) {
  const items = await db.dAppListing.findMany({
    where: {
      isActive: true,
      ...(category ? { category } : {}),
    },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: [
      { isPromoted: "desc" },
      { promotionTier: "desc" },
      { clickCount: "desc" },
    ],
  });

  let nextCursor: string | null = null;
  if (items.length > limit) {
    const next = items.pop();
    nextCursor = next?.id ?? null;
  }

  return { items, nextCursor };
}

export async function listPromotedDApps() {
  return db.dAppListing.findMany({
    where: { isActive: true, isPromoted: true },
    orderBy: { promotionTier: "desc" },
    take: 6,
  });
}

export async function getDApp(dappId: string) {
  const dapp = await db.dAppListing.findFirst({
    where: { id: dappId, isActive: true },
  });
  if (!dapp) {
    throw new TRPCError({ code: "NOT_FOUND", message: "DApp not found" });
  }
  return dapp;
}

export async function trackDAppClick(dappId: string) {
  const dapp = await db.dAppListing.update({
    where: { id: dappId },
    data: { clickCount: { increment: 1 } },
  });
  return dapp;
}
