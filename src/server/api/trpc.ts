/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { getAuth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { type NextRequest } from "next/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "@/server/db";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = (req: NextRequest) => {
  return {
    auth: getAuth(req),
    db,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT STUFF)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/**
 * Reusable middleware that enforces users are logged in before running the procedure.
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `auth` as non-nullable
      auth: ctx.auth,
    },
  });
});

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

import { type Role } from "@prisma/client";

/**
 * Middleware factory for checking user roles.
 * This middleware ensures that the user is authenticated and has one of the specified roles.
 * @param allowedRoles - A single role or an array of roles that are allowed to access the procedure.
 */
const enforceRole = (allowedRoles: Role | Role[]) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return t.middleware(({ ctx, next }) => {
    // The `enforceUserIsAuthed` middleware, which is part of `protectedProcedure`,
    // has already run at this point, so `ctx.auth.userId` is guaranteed to be present.

    const userRole = ctx.auth.sessionClaims?.publicMetadata.role as
      | Role
      | undefined;

    if (!userRole || !roles.includes(userRole)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `This action requires one of the following roles: ${roles.join(
          ", ",
        )}`,
      });
    }

    return next({
      ctx: {
        auth: ctx.auth,
      },
    });
  });
};

/**
 * Role-specific procedures
 *
 * These procedures enforce that the user is logged in and has the required role.
 *
 * @see https://trpc.io/docs/procedures
 */
export const adminProcedure = protectedProcedure.use(enforceRole("ADMINISTRATOR"));
export const supervisorProcedure = protectedProcedure.use(
  enforceRole("SUPERVISOR"),
);
export const pollingAgentProcedure = protectedProcedure.use(
  enforceRole("POLLING_AGENT"),
);

/**
 * A procedure that can be accessed by multiple roles.
 * For example, both Supervisors and Administrators might need to access certain resources.
 */
export const supervisorAndAdminProcedure = protectedProcedure.use(
  enforceRole(["SUPERVISOR", "ADMINISTRATOR"]),
);