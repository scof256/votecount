import { candidateRouter } from "@/server/api/routers/candidate";
import { electionRouter } from "@/server/api/routers/election";
import { pollingStationRouter } from "@/server/api/routers/pollingStation";
import { postRouter } from "@/server/api/routers/post";
import { voteSubmissionRouter } from "@/server/api/routers/voteSubmission";
import { userRouter } from "@/server/api/routers/user";
import { createTRPCRouter } from "@/server/api/trpc";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";

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
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Inference helpers for input types
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;