import { z } from "zod";

export const listTransactionsSchema = z.object({
  limit: z.number().min(1).max(50).default(20),
  cursor: z.string().optional(),
});
