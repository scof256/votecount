import { candidateRouter } from "@/server/api/routers/candidate";
import { electionRouter } from "@/server/api/routers/election";
import { pollingStationRouter } from "@/server/api/routers/pollingStation";
import { postRouter } from "@/server/api/routers/post";
import { aiRouter } from "@/server/api/routers/ai";
import { voteSubmissionRouter } from "@/server/api/routers/voteSubmission";
import { userRouter } from "@/server/api/routers/user";
import { createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  pollingStation: pollingStationRouter,
  election: electionRouter,
  candidate: candidateRouter,
  voteSubmission: voteSubmissionRouter,
  user: userRouter,
  ai: aiRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;