import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { getDAppSchema, listDAppsSchema, trackClickSchema } from "./schema";
import {
  getDApp,
  listDApps,
  listPromotedDApps,
  trackDAppClick,
} from "./service";

export const discoverRouter = createTRPCRouter({
  listDApps: publicProcedure.input(listDAppsSchema).query(async ({ input }) => {
    return listDApps(input.category, input.limit, input.cursor);
  }),

  listPromoted: publicProcedure.query(async () => {
    return listPromotedDApps();
  }),

  getDApp: publicProcedure.input(getDAppSchema).query(async ({ input }) => {
    return getDApp(input.dappId);
  }),

  trackClick: protectedProcedure
    .input(trackClickSchema)
    .mutation(async ({ input }) => {
      return trackDAppClick(input.dappId);
    }),
});
