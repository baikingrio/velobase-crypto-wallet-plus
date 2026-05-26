import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import {
  confirmOrderSchema,
  createOrderSchema,
  getQuoteSchema,
  listOrdersSchema,
} from "./schema";
import {
  confirmSwapOrder,
  createSwapOrder,
  getSwapQuote,
  listSwapOrders,
} from "./service";

export const swapRouter = createTRPCRouter({
  getQuote: protectedProcedure
    .input(getQuoteSchema)
    .query(async ({ ctx, input }) => {
      return getSwapQuote(ctx.session.user.id, input);
    }),

  createOrder: protectedProcedure
    .input(createOrderSchema)
    .mutation(async ({ ctx, input }) => {
      return createSwapOrder(ctx.session.user.id, input);
    }),

  confirmOrder: protectedProcedure
    .input(confirmOrderSchema)
    .mutation(async ({ ctx, input }) => {
      return confirmSwapOrder(
        ctx.session.user.id,
        input.orderId,
        input.txHash,
        input.toAmount,
      );
    }),

  listOrders: protectedProcedure
    .input(listOrdersSchema)
    .query(async ({ ctx, input }) => {
      return listSwapOrders(
        ctx.session.user.id,
        input.limit,
        input.cursor,
      );
    }),
});
