"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import * as React from "react";

import { api } from "@/trpc/react";

export default function HomePage() {
  const { data: session, status } = useSession();

  const { data: helloData } = api.post.hello.useQuery(
    { text: "from tRPC" },
    { enabled: !!session }
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
            {status === "loading" && <p>Loading session...</p>}
            {status === "unauthenticated" && (
              <div>
                <p className="mb-4">You are not signed in.</p>
                <Link
                  href="/login"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                  Sign In
                </Link>
              </div>
            )}
            {status === "authenticated" && session && (
              <div>
                <p className="mb-2">
                  Signed in as{" "}
                  <span className="font-semibold">{session.user.email}</span>
                </p>
                <p className="mb-4">
                  Your role is:{" "}
                  <span className="font-semibold">{session.user.role}</span>
                </p>
                <button
                  onClick={() => signOut()}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
                >
                  Sign Out
                </button>

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