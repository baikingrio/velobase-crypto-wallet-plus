import type { WalletChain, WalletProvider } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { validateAddressForChain } from "@/lib/crypto/chains";
import { createLogger } from "@/lib/logger";
import { db } from "@/server/db";

const logger = createLogger("wallet-service");

export interface ConnectWalletInput {
  userId: string;
  address: string;
  chain: WalletChain;
  provider: WalletProvider;
  label?: string;
}

export async function listConnections(userId: string) {
  return db.walletConnection.findMany({
    where: { userId },
    orderBy: [{ isPrimary: "desc" }, { connectedAt: "desc" }],
  });
}

export async function connectWallet(input: ConnectWalletInput) {
  const normalized = normalizeAddress(input.address, input.chain);
  if (!validateAddressForChain(normalized, input.chain)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid wallet address for chain",
    });
  }

  const existingCount = await db.walletConnection.count({
    where: { userId: input.userId },
  });

  const connection = await db.walletConnection.upsert({
    where: {
      userId_address_chain: {
        userId: input.userId,
        address: normalized,
        chain: input.chain,
      },
    },
    create: {
      userId: input.userId,
      address: normalized,
      chain: input.chain,
      provider: input.provider,
      label: input.label,
      isPrimary: existingCount === 0,
    },
    update: {
      provider: input.provider,
      label: input.label,
      connectedAt: new Date(),
    },
  });

  logger.info(
    { userId: input.userId, chain: input.chain },
    "Wallet connected",
  );
  return connection;
}

export async function disconnectWallet(userId: string, connectionId: string) {
  const connection = await db.walletConnection.findFirst({
    where: { id: connectionId, userId },
  });
  if (!connection) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Connection not found" });
  }

  await db.walletConnection.delete({ where: { id: connectionId } });

  if (connection.isPrimary) {
    const next = await db.walletConnection.findFirst({
      where: { userId },
      orderBy: { connectedAt: "desc" },
    });
    if (next) {
      await db.walletConnection.update({
        where: { id: next.id },
        data: { isPrimary: true },
      });
    }
  }

  return { success: true };
}

export async function setPrimaryWallet(userId: string, connectionId: string) {
  const connection = await db.walletConnection.findFirst({
    where: { id: connectionId, userId },
  });
  if (!connection) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Connection not found" });
  }

  await db.$transaction([
    db.walletConnection.updateMany({
      where: { userId },
      data: { isPrimary: false },
    }),
    db.walletConnection.update({
      where: { id: connectionId },
      data: { isPrimary: true },
    }),
  ]);

  return db.walletConnection.findUniqueOrThrow({ where: { id: connectionId } });
}

function normalizeAddress(address: string, chain: WalletChain): string {
  if (chain === "ETHEREUM") {
    return address.toLowerCase();
  }
  return address;
}
