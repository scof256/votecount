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

export function ElectionManagement() {
  const utils = api.useUtils();
  const { data: elections, isLoading, error } = api.election.getAllElections.useQuery();
  const createElection = api.election.createElection.useMutation({
    onSuccess: () => {
      utils.election.getAllElections.invalidate();
    },
  });
  const deleteElection = api.election.deleteElection.useMutation({
    onSuccess: () => {
      utils.election.getAllElections.invalidate();
    },
  });

  const [newElectionName, setNewElectionName] = useState("");
  const [newElectionDate, setNewElectionDate] = useState("");

  const handleCreateElection = () => {
    if (newElectionName && newElectionDate) {
      createElection.mutate(
        {
          name: newElectionName,
          date: new Date(newElectionDate),
        },
        {
          onSuccess: () => {
            setNewElectionName("");
            setNewElectionDate("");
          },
        }
      );
    }
  };

  if (isLoading) return <p>Loading elections...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Election Management</h2>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Election</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Election Name"
              value={newElectionName}
              onChange={(e) => setNewElectionName(e.target.value)}
              className="w-full rounded-md border p-2"
            />
            <input
              type="date"
              value={newElectionDate}
              onChange={(e) => setNewElectionDate(e.target.value)}
              className="w-full rounded-md border p-2"
            />
            <Button onClick={handleCreateElection} disabled={createElection.isPending}>
              {createElection.isPending ? "Creating..." : "Create Election"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {elections?.map((election) => (
          <Card key={election.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{election.name}</CardTitle>
                <p className="text-sm text-gray-500">
                  {new Date(election.date).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteElection.mutate({ id: election.id })}
                disabled={deleteElection.isPending}
              >
                Delete
              </Button>
            </CardHeader>
            <CardContent>
              <h3 className="mb-2 font-semibold">Positions:</h3>
              {election.positions.length > 0 ? (
                <ul className="list-disc pl-5">
                  {election.positions.map((position) => (
                    <li key={position.id}>{position.title}</li>
                  ))}
                </ul>
              ) : (
                <p>No positions for this election yet.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}