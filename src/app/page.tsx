"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import * as React from "react";

import { api } from "@/trpc/react";

export default function HomePage() {
  const { user, isLoaded, isSignedIn } = useUser();

  const { data: helloData } = api.post.hello.useQuery(
    { text: "from tRPC" },
    { enabled: isSignedIn }
  );

  return (
    <main>
      <section className="bg-white">
        <div className="layout relative flex min-h-screen flex-col items-center justify-center py-12 text-center">
          <h1 className="mt-4 text-4xl font-bold">
            Vote Tallying Application
          </h1>
          <p className="mt-2 text-lg text-gray-700">
            Secure and Transparent Election Results
          </p>

          <div className="mt-8 rounded-lg bg-gray-50 p-8 shadow-inner">
            {!isLoaded && <p>Loading session...</p>}
            {isLoaded && !isSignedIn && (
              <div>
                <p className="mb-4">You are not signed in.</p>
                <SignInButton mode="modal">
                  <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            )}
            {isLoaded && isSignedIn && user && (
              <div>
                <div className="mb-4 flex items-center justify-center gap-4">
                  <p>
                    Signed in as{" "}
                    <span className="font-semibold">
                      {user.primaryEmailAddress?.emailAddress}
                    </span>
                  </p>
                  <UserButton afterSignOutUrl="/" />
                </div>
                <p className="mb-4">
                  Your role is:{" "}
                  <span className="font-semibold">
                    {(user.publicMetadata.role as string) ?? "No role assigned"}
                  </span>
                </p>

                <div className="mt-6 border-t pt-6">
                  <h2 className="text-xl font-semibold">tRPC Test</h2>
                  <p className="mt-2">
                    {helloData
                      ? helloData.greeting
                      : "Loading tRPC query..."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}