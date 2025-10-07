"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import * as React from "react";

import { api } from "@/trpc/react";
import { Dashboard } from "./Dashboard";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  // For now, let's allow any logged-in user to see the dashboard.
  // This could be restricted further later.
  const hasAccess = !!user;

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading session...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2">Please log in to view the dashboard.</p>
        <Link href="/sign-in" className="mt-4 text-indigo-600 hover:underline">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <section className="py-12">
        <div>
          <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
          <p className="mt-2 text-lg text-gray-700">
            Real-time overview of the election results.
          </p>
        </div>

        <div className="mt-8">
          <Dashboard />
        </div>
      </section>
    </main>
  );
}