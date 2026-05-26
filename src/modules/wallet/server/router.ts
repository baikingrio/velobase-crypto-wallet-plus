import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import {
  connectWalletSchema,
  disconnectWalletSchema,
  setPrimaryWalletSchema,
} from "./schema";
import {
  connectWallet,
  disconnectWallet,
  listConnections,
  setPrimaryWallet,
} from "./service";

export const walletRouter = createTRPCRouter({
  listConnections: protectedProcedure.query(async ({ ctx }) => {
    return listConnections(ctx.session.user.id);
  }),

  connect: protectedProcedure
    .input(connectWalletSchema)
    .mutation(async ({ ctx, input }) => {
      return connectWallet({
        userId: ctx.session.user.id,
        address: input.address,
        chain: input.chain,
        provider: input.provider,
        label: input.label,
      });
    }),

  disconnect: protectedProcedure
    .input(disconnectWalletSchema)
    .mutation(async ({ ctx, input }) => {
      return disconnectWallet(ctx.session.user.id, input.connectionId);
    }),

  setPrimary: protectedProcedure
    .input(setPrimaryWalletSchema)
    .mutation(async ({ ctx, input }) => {
      return setPrimaryWallet(ctx.session.user.id, input.connectionId);
    }),
});
