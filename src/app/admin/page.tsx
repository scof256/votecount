"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import * as React from "react";

import { ElectionManager } from "@/components/admin/ElectionManager";

export default function AdminDashboardPage() {
  const { user } = useUser();

  // This is a client-side check. The API endpoints will be protected by middleware.
  if (user?.publicMetadata.role !== "ADMINISTRATOR") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2">
          You do not have permission to view this page.
        </p>
        <Link href="/" className="mt-4 text-indigo-600 hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <main>
      <section className="bg-white">
        <div className="layout relative flex min-h-screen flex-col items-center py-12 text-center">
          <h1 className="mt-4 text-4xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-gray-700">
            Manage elections, positions, and candidates.
          </p>

          <div className="mt-8 w-full max-w-4xl rounded-lg bg-gray-50 p-8 text-left shadow-inner">
            <ElectionManager />
          </div>
        </div>
      </section>
    </main>
  );
}