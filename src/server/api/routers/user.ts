import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.auth.userId!,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        assignedPollingStation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found in the database.",
      });
    }

    return user;
  }),
});