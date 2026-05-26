import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { listTransactionsSchema } from "./schema";
import { getPortfolioOverview, listRecentSwaps } from "./service";

export const portfolioRouter = createTRPCRouter({
  getOverview: protectedProcedure.query(async ({ ctx }) => {
    return getPortfolioOverview(ctx.session.user.id);
  }),

  getTransactions: protectedProcedure
    .input(listTransactionsSchema)
    .query(async ({ ctx, input }) => {
      const items = await listRecentSwaps(ctx.session.user.id, input.limit);
      return {
        items,
        nextCursor:
          items.length === input.limit
            ? (items[items.length - 1]?.id ?? null)
            : null,
      };
    }),
});
