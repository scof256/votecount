"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import * as React from "react";
import { type SubmissionStatus } from "@prisma/client";

import { api } from "@/trpc/react";

function VerificationDashboard() {
  const { data: submissions, isLoading } = api.voteSubmission.getAll.useQuery();
  const utils = api.useUtils();

  const { mutate: updateStatus, isPending: isUpdating } =
    api.voteSubmission.updateStatus.useMutation({
      onSuccess: async () => {
        // When a submission is updated, refetch the list to show the change
        await utils.voteSubmission.getAll.invalidate();
      },
      onError: (error) => {
        alert(`Error updating status: ${error.message}`);
      },
    });

  const handleUpdateStatus = (id: string, status: SubmissionStatus) => {
    if (isUpdating) return;
    updateStatus({ id, status });
  };

  if (isLoading) {
    return <p>Loading submissions...</p>;
  }

  if (!submissions || submissions.length === 0) {
    return <p>No submissions found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Polling Station
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Submitted By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {submissions.map((s) => (
            <tr key={s.id}>
              <td className="whitespace-nowrap px-6 py-4">
                {s.pollingStation.name}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {s.submittedBy.name ?? s.submittedBy.email}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    s.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : s.status === "VERIFIED"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {s.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                <Link
                  href={`/verify/${s.id}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  View Details
                </Link>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                <button
                  onClick={() => handleUpdateStatus(s.id, "VERIFIED")}
                  disabled={isUpdating || s.status === "VERIFIED"}
                  className="mr-2 text-indigo-600 hover:text-indigo-900 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  Verify
                </button>
                <button
                  onClick={() => handleUpdateStatus(s.id, "REJECTED")}
                   disabled={isUpdating || s.status === "REJECTED"}
                  className="text-red-600 hover:text-red-900 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function VerificationPage() {
  const { user, isLoaded } = useUser();
  const hasAccess =
    user?.publicMetadata.role === "SUPERVISOR" ||
    user?.publicMetadata.role === "ADMINISTRATOR";

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
      <section className="bg-white py-12">
        <div className="layout">
          <h1 className="text-4xl font-bold">Submission Verification</h1>
          <p className="mt-2 text-lg text-gray-700">
            Review and approve incoming vote submissions.
          </p>

          <div className="mt-8 w-full rounded-lg bg-gray-50 p-8 shadow-inner">
            <VerificationDashboard />
          </div>
        </div>
      </section>
    </main>
  );
}