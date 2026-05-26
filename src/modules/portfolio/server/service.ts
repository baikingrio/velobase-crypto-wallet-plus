import { fetchPortfolioForAddresses } from "@/lib/crypto/balances";
import { db } from "@/server/db";

export async function getPortfolioOverview(userId: string) {
  const connections = await db.walletConnection.findMany({
    where: { userId },
  });

  const portfolio = await fetchPortfolioForAddresses(
    connections.map((c) => ({ address: c.address, chain: c.chain })),
  );

  return {
    ...portfolio,
    connections,
  };
}

export async function listRecentSwaps(userId: string, limit: number) {
  return db.swapOrder.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
