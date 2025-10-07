import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";

export const pollingStationRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.pollingStation.create({
        data: {
          name: input.name,
          location: input.location,
        },
      });
    }),

  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.db.pollingStation.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.pollingStation.update({
        where: { id: input.id },
        data: {
          name: input.name,
          location: input.location,
        },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.pollingStation.delete({
        where: { id: input.id },
      });
    }),
});