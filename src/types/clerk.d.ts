import { type Role } from "@prisma/client";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
      CLERK_SECRET_KEY: string;
    }
  }
}

declare module "@clerk/nextjs/server" {
  interface CustomJwtSessionClaims {
    publicMetadata: {
      role?: Role;
    };
  }
}

// If you want to use the same types on the client, you can export them
// and import them in a separate file.
export {};