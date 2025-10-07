"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { type z } from "zod";

import { api } from "@/trpc/react";
import { type AppRouter } from "@/server/api/root";

type VoteSubmissionInput = z.infer<
  AppRouter["voteSubmission"]["submit"]["_def"]["_input_"]
>;

function VoteSubmissionForm() {
  const router = useRouter();
  const [selectedElectionId, setSelectedElectionId] = React.useState<
    string | null
  >(null);
  const [selectedPositionId, setSelectedPositionId] = React.useState<
    string | null
  >(null);
  const [votes, setVotes] = React.useState<VoteSubmissionInput["votes"]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const { data: me, isLoading: isLoadingMe } = api.user.me.useQuery();
  const { data: elections, isLoading: isLoadingElections } =
    api.election.getActiveElections.useQuery();

  const { data: positions, isLoading: isLoadingPositions } =
    api.election.getPositionsForElection.useQuery(
      { electionId: selectedElectionId! },
      { enabled: !!selectedElectionId },
    );

  const { data: candidates, isLoading: isLoadingCandidates } =
    api.candidate.getByPosition.useQuery(
      { positionId: selectedPositionId! },
      { enabled: !!selectedPositionId },
    );

  const { mutate: submitVotes, isPending: isSubmitting } =
    api.voteSubmission.submit.useMutation({
      onSuccess: () => {
        // In a real app, you might want to redirect to a "success" page
        // or to a list of the user's submissions.
        router.push("/");
      },
      onError: (error) => {
        setError(`Error submitting votes: ${error.message}`);
      },
    });

  const handleVoteChange = (candidateId: string, value: string) => {
    const voteCount = parseInt(value, 10);
    if (isNaN(voteCount) || voteCount < 0) return;

    setVotes((prevVotes) => {
      const existingVote = prevVotes.find(
        (v) => v.candidateId === candidateId,
      );
      if (existingVote) {
        return prevVotes.map((v) =>
          v.candidateId === candidateId ? { ...v, voteCount } : v,
        );
      }
      return [...prevVotes, { candidateId, voteCount }];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    if (!selectedPositionId || votes.length === 0) {
      setError("Please select a position and enter at least one vote count.");
      return;
    }

    submitVotes({
      positionId: selectedPositionId,
      votes,
    });
  };

  if (isLoadingMe || isLoadingElections) {
    return <p>Loading submission form...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="pollingStation"
          className="block text-sm font-medium text-gray-700"
        >
          Polling Station
        </label>
        <input
          id="pollingStation"
          type="text"
          disabled
          value={me?.assignedPollingStation?.name ?? "Not assigned"}
          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
        />
      </div>

      <div>
        <label
          htmlFor="election"
          className="block text-sm font-medium text-gray-700"
        >
          Select Election
        </label>
        <select
          id="election"
          onChange={(e) => {
            setSelectedElectionId(e.target.value);
            setSelectedPositionId(null);
            setVotes([]);
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option>Select an election</option>
          {elections?.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>

      {isLoadingPositions && <p>Loading positions...</p>}
      {positions && (
        <div>
          <label
            htmlFor="position"
            className="block text-sm font-medium text-gray-700"
          >
            Select Position
          </label>
          <select
            id="position"
            onChange={(e) => {
              setSelectedPositionId(e.target.value);
              setVotes([]);
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option>Select a position</option>
            {positions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoadingCandidates && <p>Loading candidates...</p>}
      {candidates && candidates.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Enter Vote Counts</h3>
          {candidates.map((c) => (
            <div key={c.id} className="flex items-center justify-between">
              <label htmlFor={`candidate-${c.id}`} className="text-sm">
                {c.name} ({c.politicalParty})
              </label>
              <input
                id={`candidate-${c.id}`}
                type="number"
                min="0"
                onChange={(e) => handleVoteChange(c.id, e.target.value)}
                className="w-32 rounded-md border-gray-300 text-right shadow-sm"
              />
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting || !selectedPositionId}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit Votes"}
      </button>
    </form>
  );
}

export default function NewSubmissionPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading session...</p>
      </div>
    );
  }

  // This is a client-side check. The API endpoints are protected by middleware.
  if (user?.publicMetadata.role !== "POLLING_AGENT") {
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
          <h1 className="text-4xl font-bold">New Vote Submission</h1>
          <p className="mt-2 text-lg text-gray-700">
            Submit vote counts for your assigned polling station.
          </p>

          <div className="mt-8 w-full max-w-2xl rounded-lg bg-gray-50 p-8 shadow-inner">
            <VoteSubmissionForm />
          </div>
        </div>
      </section>
    </main>
  );
}