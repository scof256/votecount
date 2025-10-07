import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";

export const electionRouter = createTRPCRouter({
  // Election-specific procedures
  createElection: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        date: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.election.create({
        data: {
          name: input.name,
          date: input.date,
        },
      });
    }),

  getAllElections: adminProcedure.query(({ ctx }) => {
    return ctx.db.election.findMany({
      orderBy: { date: "desc" },
      include: { positions: true },
    });
  }),

  // Position-specific procedures
  createPosition: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        electionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.position.create({
        data: {
          title: input.title,
          electionId: input.electionId,
        },
      });
    }),

  getPositionsByElection: adminProcedure
    .input(z.object({ electionId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.position.findMany({
        where: { electionId: input.electionId },
        orderBy: { title: "asc" },
      });
    }),
});