"use client";

import * as React from "react";
import { api } from "@/trpc/react";

function CreateElectionForm() {
  const [name, setName] = React.useState("");
  const [date, setDate] = React.useState("");
  const utils = api.useUtils();

  const { mutate: createElection, isPending } =
    api.election.createElection.useMutation({
      onSuccess: async () => {
        await utils.election.getAllElections.invalidate();
        setName("");
        setDate("");
      },
      onError: (error) => {
        alert(`Error creating election: ${error.message}`);
      },
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date) {
      alert("Please provide a name and a date for the election.");
      return;
    }
    createElection({ name, date: new Date(date) });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 rounded-lg border p-4">
      <h3 className="text-xl font-semibold">Create New Election</h3>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="election-name" className="block text-sm font-medium">
            Election Name
          </label>
          <input
            id="election-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="election-date" className="block text-sm font-medium">
            Election Date
          </label>
          <input
            id="election-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div className="self-end">
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create Election"}
          </button>
        </div>
      </div>
    </form>
  );
}

export function ElectionManager() {
  const { data: elections, isLoading } = api.election.getAllElections.useQuery();

  if (isLoading) {
    return <p>Loading elections...</p>;
  }

  return (
    <div>
      <CreateElectionForm />
      <h2 className="text-2xl font-semibold">Existing Elections</h2>
      <div className="mt-4 space-y-4">
        {elections?.map((election) => (
          <div key={election.id} className="rounded-lg border p-4">
            <h3 className="text-lg font-bold">{election.name}</h3>
            <p className="text-sm text-gray-600">
              Date: {new Date(election.date).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              Positions: {election.positions.length}
            </p>
            {/* TODO: Add links to manage positions and candidates for this election */}
          </div>
        ))}
      </div>
    </div>
  );
}