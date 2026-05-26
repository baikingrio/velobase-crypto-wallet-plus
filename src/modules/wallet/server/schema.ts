import { WalletChain, WalletProvider } from "@prisma/client";
import { z } from "zod";

export const connectWalletSchema = z.object({
  address: z.string().min(1),
  chain: z.nativeEnum(WalletChain),
  provider: z.nativeEnum(WalletProvider).default(WalletProvider.OTHER),
  label: z.string().max(100).optional(),
});

export const disconnectWalletSchema = z.object({
  connectionId: z.string().cuid(),
});

export const setPrimaryWalletSchema = z.object({
  connectionId: z.string().cuid(),
});
