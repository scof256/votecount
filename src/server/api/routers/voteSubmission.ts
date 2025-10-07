import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { type Role } from "@prisma/client";

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const voteSubmissionRouter = createTRPCRouter({
  submit: protectedProcedure
    .input(
      z.object({
        pollingStationId: z.string(),
        positionId: z.string(),
        votes: z.array(
          z.object({
            candidateId: z.string(),
            voteCount: z.number().int().min(0),
          })
        ).min(1),
        declarationFormImageUrls: z.array(z.string().url()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { auth } = ctx;
      const {
        pollingStationId,
        positionId,
        votes,
        declarationFormImageUrls,
      } = input;

      // Ensure the user is a polling agent
      if (
        (auth.sessionClaims?.publicMetadata as { role?: Role })?.role !==
        "POLLING_AGENT"
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only polling agents can submit vote counts.",
        });
      }

      // Use a transaction to ensure all or nothing is written to the db
      return ctx.db.$transaction(async (prisma) => {
        const submission = await prisma.voteSubmission.create({
          data: {
            pollingStationId,
            positionId,
            submittedById: auth.userId,
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

  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.db.voteSubmission.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        pollingStation: true,
        submittedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }),

  getById: adminProcedure
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
});