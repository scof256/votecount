import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

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

  getElectionById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.election.findUnique({
        where: { id: input.id },
        include: { positions: { include: { candidates: true } } },
      });
    }),

  updateElection: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        date: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.election.update({
        where: { id: input.id },
        data: {
          name: input.name,
          date: input.date,
        },
      });
    }),

  deleteElection: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Note: Add logic here to handle cascading deletes if necessary
      return ctx.db.election.delete({
        where: { id: input.id },
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

  updatePosition: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.position.update({
        where: { id: input.id },
        data: {
          title: input.title,
        },
      });
    }),

  deletePosition: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.position.delete({
        where: { id: input.id },
      });
    }),

  // Public-facing procedures for submissions
  getActiveElections: protectedProcedure.query(({ ctx }) => {
    return ctx.db.election.findMany({
      // In a real app, you might filter for elections that are currently active
      orderBy: { date: "desc" },
      select: { id: true, name: true },
    });
  }),

  getPositionsForElection: protectedProcedure
    .input(z.object({ electionId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.position.findMany({
        where: { electionId: input.electionId },
        orderBy: { title: "asc" },
        select: { id: true, title: true },
      });
    }),
});