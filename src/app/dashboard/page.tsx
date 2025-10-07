"use client";

import * as React from "react";

import { api } from "@/trpc/react";

function ResultsDashboard() {
  const { data: results, isLoading: isLoadingResults } =
    api.voteSubmission.getResults.useQuery();

  // This is not efficient for a large number of candidates,
  // but it's acceptable for this example.
  // In a real application, you might want to create a dedicated
  // procedure that joins the results with the candidate data.
  const { data: candidates, isLoading: isLoadingCandidates } =
    api.candidate.getAll.useQuery(); // Assuming a getAll procedure exists

  if (isLoadingResults || isLoadingCandidates) {
    return <p>Loading results...</p>;
  }

  if (!results || results.length === 0) {
    return <p>No verified results available yet.</p>;
  }

  const resultsWithCandidateInfo = results.map((r) => {
    const candidate = candidates?.find((c) => c.id === r.candidateId);
    return {
      ...r,
      candidateName: candidate?.name ?? "Unknown",
      candidateParty: candidate?.politicalParty ?? "N/A",
    };
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Candidate
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Party
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Total Votes
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {resultsWithCandidateInfo.map((r) => (
            <tr key={r.candidateId}>
              <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                {r.candidateName}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                {r.candidateParty}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right font-bold text-gray-900">
                {r._sum.voteCount?.toLocaleString() ?? 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <main>
      <section className="bg-white py-12">
        <div className="layout">
          <h1 className="text-4xl font-bold">Election Results</h1>
          <p className="mt-2 text-lg text-gray-700">
            Live results from verified vote submissions.
          </p>

          <div className="mt-8 w-full max-w-4xl rounded-lg bg-gray-50 p-8 shadow-inner">
            <ResultsDashboard />
          </div>
        </div>
      </section>
    </main>
  );
}