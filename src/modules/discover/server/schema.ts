import { DAppCategory } from "@prisma/client";
import { z } from "zod";

export const listDAppsSchema = z.object({
  category: z.nativeEnum(DAppCategory).optional(),
  limit: z.number().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export const getDAppSchema = z.object({
  dappId: z.string().cuid(),
});

export const trackClickSchema = z.object({
  dappId: z.string().cuid(),
});
