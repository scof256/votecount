import { z } from "zod";
import { SubmissionStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  pollingAgentProcedure,
  publicProcedure,
  supervisorAndAdminProcedure,
} from "@/server/api/trpc";

export const voteSubmissionRouter = createTRPCRouter({
  submit: pollingAgentProcedure
    .input(
      z.object({
        positionId: z.string(),
        votes: z.array(
          z.object({
            candidateId: z.string(),
            voteCount: z.number().int().min(0),
          }),
        ).min(1),
        declarationFormImageUrls: z.array(z.string().url()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { positionId, votes, declarationFormImageUrls } = input;

      const user = await ctx.db.user.findUnique({
        where: { id: ctx.auth.userId! },
        select: { assignedPollingStationId: true },
      });

      if (!user?.assignedPollingStationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not assigned to a polling station.",
        });
      }

      // Use a transaction to ensure all or nothing is written to the db
      return ctx.db.$transaction(async (prisma) => {
        const submission = await prisma.voteSubmission.create({
          data: {
            pollingStationId: user.assignedPollingStationId!,
            positionId,
            submittedById: ctx.auth.userId!,
            status: "PENDING",
            votes: {
              createMany: {
                data: votes.map((vote) => ({
                  candidateId: vote.candidateId,
                  voteCount: vote.voteCount,
                })),
              },
            },
            declarationFormImages: {
              createMany: {
                data:
                  declarationFormImageUrls?.map((url) => ({
                    url,
                  })) ?? [],
              },
            },
          },
        });

        return submission;
      });
    }),

  getMySubmissions: pollingAgentProcedure.query(({ ctx }) => {
    return ctx.db.voteSubmission.findMany({
      where: { submittedById: ctx.auth.userId! },
      orderBy: { createdAt: "desc" },
      include: {
        pollingStation: true,
        position: true,
      },
    });
  }),

  getAll: supervisorAndAdminProcedure.query(({ ctx }) => {
    return ctx.db.voteSubmission.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        pollingStation: true,
        position: true, // Include the position details
        submittedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }),

  getById: supervisorAndAdminProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.voteSubmission.findUnique({
        where: { id: input.id },
        include: {
          pollingStation: true,
          submittedBy: true,
          votes: {
            include: {
              candidate: true,
            },
          },
          declarationFormImages: true,
          aiResult: true,
        },
      });
    }),

  updateStatus: supervisorAndAdminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(SubmissionStatus),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.voteSubmission.update({
        where: { id: input.id },
        data: {
          status: input.status,
        },
      });
    }),

  getResults: publicProcedure.query(({ ctx }) => {
    return ctx.db.candidateVote.groupBy({
      by: ["candidateId"],
      where: {
        submission: {
          status: "VERIFIED",
        },
      },
      _sum: {
        voteCount: true,
      },
      orderBy: {
        _sum: {
          voteCount: "desc",
        },
      },
    });
  }),
});