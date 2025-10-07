import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware({
  publicRoutes: ["/"],
  afterAuth(auth, req) {
    if (auth.userId && auth.isPublicRoute) {
      const dashboardUrl = new URL("/dashboard", req.url);
      return NextResponse.redirect(dashboardUrl);
    }
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};