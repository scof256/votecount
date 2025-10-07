"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// A single user row component to manage its own state
function UserRow({ user, pollingStations }: { user: any; pollingStations: any[] }) {
  const utils = api.useUtils();
  const [role, setRole] = useState<Role>(user.role);
  const [assignedStation, setAssignedStation] = useState<string | null>(
    user.assignedPollingStationId
  );

  const updateUser = api.user.updateUser.useMutation({
    onSuccess: () => {
      utils.user.getAll.invalidate();
    },
  });

  const handleUpdate = () => {
    updateUser.mutate({
      userId: user.id,
      role,
      assignedPollingStationId: assignedStation,
    });
  };

  const isChanged = user.role !== role || user.assignedPollingStationId !== assignedStation;

  return (
    <CardContent className="grid grid-cols-4 items-center gap-4 p-4">
      <div>
        <p className="font-semibold">{user.name ?? "Unnamed"}</p>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
      <div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="w-full rounded-md border p-2"
        >
          {Object.values(Role).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <div>
        <select
          value={assignedStation ?? ""}
          onChange={(e) => setAssignedStation(e.target.value || null)}
          className="w-full rounded-md border p-2"
          disabled={role !== "POLLING_AGENT"}
        >
          <option value="">-- Unassigned --</option>
          {pollingStations.map((station) => (
            <option key={station.id} value={station.id}>
              {station.name}
            </option>
          ))}
        </select>
      </div>
      <Button onClick={handleUpdate} disabled={updateUser.isPending || !isChanged}>
        {updateUser.isPending ? "Saving..." : "Save"}
      </Button>
    </CardContent>
  );
}

export function UserManagement() {
  const { data: users, isLoading: isLoadingUsers, error: usersError } = api.user.getAll.useQuery();
  const { data: stations, isLoading: isLoadingStations, error: stationsError } = api.pollingStation.getAll.useQuery();

  if (isLoadingUsers || isLoadingStations) return <p>Loading data...</p>;
  if (usersError) return <p>Error loading users: {usersError.message}</p>;
  if (stationsError) return <p>Error loading stations: {stationsError.message}</p>;

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">User Management</h2>
      <Card>
        <div className="grid grid-cols-4 gap-4 border-b p-4 font-semibold">
          <p>User</p>
          <p>Role</p>
          <p>Assigned Polling Station</p>
          <p>Action</p>
        </div>
        {users?.map((user) => (
          <UserRow key={user.id} user={user} pollingStations={stations ?? []} />
        ))}
        {users?.length === 0 && <p className="p-4">No users found.</p>}
      </Card>
    </div>
  );
}