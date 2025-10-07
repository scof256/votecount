import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";

export const candidateRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        politicalParty: z.string().optional(),
        positionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.candidate.create({
        data: {
          name: input.name,
          politicalParty: input.politicalParty,
          positionId: input.positionId,
        },
      });
    }),

  getByPosition: adminProcedure
    .input(z.object({ positionId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.candidate.findMany({
        where: { positionId: input.positionId },
        orderBy: { name: "asc" },
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        politicalParty: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.candidate.update({
        where: { id: input.id },
        data: {
          name: input.name,
          politicalParty: input.politicalParty,
        },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.candidate.delete({
        where: { id: input.id },
      });
    }),
});