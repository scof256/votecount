"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export function Header() {
  const { user } = useUser();
  const role = user?.publicMetadata.role as string | undefined;
  const isAdmin = role === "ADMINISTRATOR";
  const isSupervisor = role === "SUPERVISOR";

  return (
    <header className="bg-white shadow-md">
      <nav className="layout flex items-center justify-between py-4">
        <Link href="/" className="text-xl font-bold text-gray-800">
          Vote Tally
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-600 hover:text-indigo-600"
          >
            Results Dashboard
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm font-medium text-gray-600 hover:text-indigo-600"
            >
              Admin Dashboard
            </Link>
          )}
          {(isAdmin || isSupervisor) && (
            <Link
              href="/verify"
              className="text-sm font-medium text-gray-600 hover:text-indigo-600"
            >
              Verify Submissions
            </Link>
          )}
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>
    </header>
  );
}