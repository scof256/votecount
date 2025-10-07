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

export function PollingStationManagement() {
  const utils = api.useUtils();
  const { data: stations, isLoading, error } = api.pollingStation.getAll.useQuery();

  const createStation = api.pollingStation.create.useMutation({
    onSuccess: () => {
      utils.pollingStation.getAll.invalidate();
    },
  });

  const deleteStation = api.pollingStation.delete.useMutation({
    onSuccess: () => {
      utils.pollingStation.getAll.invalidate();
    },
  });

  const [newStationName, setNewStationName] = useState("");
  const [newStationLocation, setNewStationLocation] = useState("");

  const handleCreateStation = () => {
    if (newStationName) {
      createStation.mutate(
        {
          name: newStationName,
          location: newStationLocation,
        },
        {
          onSuccess: () => {
            setNewStationName("");
            setNewStationLocation("");
          },
        }
      );
    }
  };

  if (isLoading) return <p>Loading polling stations...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Polling Station Management</h2>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Polling Station</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Station Name"
              value={newStationName}
              onChange={(e) => setNewStationName(e.target.value)}
              className="w-full rounded-md border p-2"
            />
            <input
              type="text"
              placeholder="Location (Optional)"
              value={newStationLocation}
              onChange={(e) => setNewStationLocation(e.target.value)}
              className="w-full rounded-md border p-2"
            />
            <Button onClick={handleCreateStation} disabled={createStation.isPending}>
              {createStation.isPending ? "Creating..." : "Create Station"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {stations?.map((station) => (
          <Card key={station.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold">{station.name}</p>
                <p className="text-sm text-gray-500">{station.location}</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteStation.mutate({ id: station.id })}
                disabled={deleteStation.isPending}
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
        {stations?.length === 0 && <p>No polling stations created yet.</p>}
      </div>
    </div>
  );
}