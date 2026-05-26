import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  getProductSchema,
  listPositionsSchema,
  listProductsSchema,
  openPositionSchema,
} from "./schema";
import {
  getEarnProduct,
  listEarnPositions,
  listEarnProducts,
  openEarnPosition,
} from "./service";

export const earnRouter = createTRPCRouter({
  listProducts: publicProcedure
    .input(listProductsSchema)
    .query(async ({ input }) => {
      return listEarnProducts(input.chain, input.limit, input.cursor);
    }),

  getProduct: publicProcedure
    .input(getProductSchema)
    .query(async ({ input }) => {
      return getEarnProduct(input.productId);
    }),

  listPositions: protectedProcedure
    .input(listPositionsSchema)
    .query(async ({ ctx, input }) => {
      return listEarnPositions(
        ctx.session.user.id,
        input.limit,
        input.cursor,
      );
    }),

  openPosition: protectedProcedure
    .input(openPositionSchema)
    .mutation(async ({ ctx, input }) => {
      return openEarnPosition(
        ctx.session.user.id,
        input.productId,
        input.depositedAmount,
      );
    }),
});
