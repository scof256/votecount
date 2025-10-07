"use client";

import React from "react";
import { api } from "@/trpc/react";
import { SubmissionStatus } from "@prisma/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusColors: { [key in SubmissionStatus]: string } = {
  PENDING: "bg-yellow-500",
  VERIFIED: "bg-green-500",
  REJECTED: "bg-red-500",
  FLAGGED_ANOMALY: "bg-purple-500",
};

export function VoteSubmissionManagement() {
  const utils = api.useUtils();
  const { data: submissions, isLoading, error } = api.voteSubmission.getAll.useQuery();

  const updateStatus = api.voteSubmission.updateStatus.useMutation({
    onSuccess: () => {
      utils.voteSubmission.getAll.invalidate();
    },
  });

  if (isLoading) return <p>Loading submissions...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Vote Submission Review</h2>
      <div className="space-y-4">
        {submissions?.map((submission) => (
          <Card key={submission.id}>
            <CardHeader>
              <CardTitle>
                Submission from {submission.pollingStation.name}
              </CardTitle>
              <CardDescription>
                Submitted by: {submission.submittedBy.name} (
                {submission.submittedBy.email}) on{" "}
                {new Date(submission.createdAt).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Status:</span>
                  <Badge className={statusColors[submission.status]}>
                    {submission.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {Object.values(SubmissionStatus).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={submission.status === status ? "default" : "outline"}
                      onClick={() =>
                        updateStatus.mutate({ id: submission.id, status })
                      }
                      disabled={updateStatus.isPending}
                    >
                      Set to {status}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {submissions?.length === 0 && <p>No submissions found.</p>}
      </div>
    </div>
  );
}