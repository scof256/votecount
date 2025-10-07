import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Role } from "@prisma/client";

import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "@/server/api/trpc";

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

  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.db.user.findMany({
      orderBy: { name: "asc" },
      include: {
        assignedPollingStation: true,
      },
    });
  }),

  updateUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.nativeEnum(Role),
        assignedPollingStationId: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, role, assignedPollingStationId } = input;
      return ctx.db.user.update({
        where: { id: userId },
        data: {
          role,
          assignedPollingStationId,
        },
      });
    }),
});