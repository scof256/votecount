import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  supervisorAndAdminProcedure,
} from "@/server/api/trpc";
import { analyzeDeclarationForm } from "@/server/services/ai/openai";

export const aiRouter = createTRPCRouter({
  analyzeSubmission: supervisorAndAdminProcedure
    .input(z.object({ submissionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { submissionId } = input;

      const submission = await ctx.db.voteSubmission.findUnique({
        where: { id: submissionId },
        include: {
          declarationFormImages: true,
          position: {
            include: {
              candidates: true, // Fetch candidates for name-to-ID mapping
            },
          },
        },
      });

      if (!submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission not found.",
        });
      }

      const imageUrl = submission.declarationFormImages[0]?.url;
      if (!imageUrl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Submission has no declaration form image to analyze.",
        });
      }

      // Call the new AI service
      const aiAnalysisResult = await analyzeDeclarationForm(imageUrl);

      // Map AI-extracted candidate names to actual candidate IDs
      const ocrVotes = aiAnalysisResult.votes.map((aiVote) => {
        const candidate = submission.position.candidates.find(
          (c) => c.name.toLowerCase() === aiVote.candidateName.toLowerCase(),
        );
        return {
          ...aiVote,
          candidateId: candidate?.id ?? null, // Store null if no match found
        };
      });

      const isFlagged =
        !aiAnalysisResult.isLegible ||
        aiAnalysisResult.tamperingSigns.length > 0 ||
        ocrVotes.some((v) => v.candidateId === null); // Flag if any candidate name didn't match

      // Save the analysis result to the database
      const savedResult = await ctx.db.aiResult.upsert({
        where: { submissionId: submission.id },
        create: {
          submissionId: submission.id,
          ocrData: { ...aiAnalysisResult, votes: ocrVotes }, // Store mapped votes
          isFlagged,
          // Other statistical fields can be added later
        },
        update: {
          ocrData: { ...aiAnalysisResult, votes: ocrVotes },
          isFlagged,
        },
      });

      // If the analysis flagged the submission, update its status
      if (isFlagged) {
        await ctx.db.voteSubmission.update({
          where: { id: submission.id },
          data: { status: "FLAGGED_ANOMALY" },
        });
      }

      return savedResult;
    }),
});