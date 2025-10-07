"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CandidateManagement() {
  const utils = api.useUtils();
  const { data: elections } = api.election.getAllElections.useQuery();
  const [selectedElectionId, setSelectedElectionId] = useState<string | null>(null);
  const { data: positions } = api.election.getPositionsByElection.useQuery(
    { electionId: selectedElectionId! },
    { enabled: !!selectedElectionId }
  );
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const { data: candidates } = api.candidate.getByPosition.useQuery(
    { positionId: selectedPositionId! },
    { enabled: !!selectedPositionId }
  );

  const createCandidate = api.candidate.create.useMutation({
    onSuccess: () => {
      utils.candidate.getByPosition.invalidate({ positionId: selectedPositionId! });
    },
  });

  const deleteCandidate = api.candidate.delete.useMutation({
    onSuccess: () => {
      utils.candidate.getByPosition.invalidate({ positionId: selectedPositionId! });
    },
  });

  const [newCandidateName, setNewCandidateName] = useState("");
  const [newCandidateParty, setNewCandidateParty] = useState("");

  const handleCreateCandidate = () => {
    if (newCandidateName && selectedPositionId) {
      createCandidate.mutate(
        {
          name: newCandidateName,
          politicalParty: newCandidateParty,
          positionId: selectedPositionId,
        },
        {
          onSuccess: () => {
            setNewCandidateName("");
            setNewCandidateParty("");
          },
        }
      );
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Candidate Management</h2>

      <div className="mb-4 space-y-2">
        <label htmlFor="election-select" className="block text-sm font-medium text-gray-700">
          Select Election
        </label>
        <select
          id="election-select"
          className="w-full rounded-md border p-2"
          onChange={(e) => {
            setSelectedElectionId(e.target.value);
            setSelectedPositionId(null);
          }}
        >
          <option value="">-- Select an Election --</option>
          {elections?.map((election) => (
            <option key={election.id} value={election.id}>
              {election.name}
            </option>
          ))}
        </select>
      </div>

      {selectedElectionId && (
        <div className="mb-8 space-y-2">
          <label htmlFor="position-select" className="block text-sm font-medium text-gray-700">
            Select Position
          </label>
          <select
            id="position-select"
            className="w-full rounded-md border p-2"
            onChange={(e) => setSelectedPositionId(e.target.value)}
            disabled={!positions}
          >
            <option value="">-- Select a Position --</option>
            {positions?.map((position) => (
              <option key={position.id} value={position.id}>
                {position.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedPositionId && (
        <>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Candidate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Candidate Name"
                  value={newCandidateName}
                  onChange={(e) => setNewCandidateName(e.target.value)}
                  className="w-full rounded-md border p-2"
                />
                <input
                  type="text"
                  placeholder="Political Party (Optional)"
                  value={newCandidateParty}
                  onChange={(e) => setNewCandidateParty(e.target.value)}
                  className="w-full rounded-md border p-2"
                />
                <Button onClick={handleCreateCandidate} disabled={createCandidate.isPending}>
                  {createCandidate.isPending ? "Adding..." : "Add Candidate"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Candidates</h3>
            {candidates?.map((candidate) => (
              <Card key={candidate.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold">{candidate.name}</p>
                    <p className="text-sm text-gray-500">{candidate.politicalParty}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteCandidate.mutate({ id: candidate.id })}
                    disabled={deleteCandidate.isPending}
                  >
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
            {candidates?.length === 0 && <p>No candidates for this position yet.</p>}
          </div>
        </>
      )}
    </div>
  );
}