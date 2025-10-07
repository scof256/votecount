"use client";

import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button"; // I'll create this button component next
import { type SubmissionStatus } from "@prisma/client";
import { type AppRouter } from "@/server/api/root";
import { type inferProcedureOutput } from "@trpc/server";

type SubmissionObject = inferProcedureOutput<AppRouter["voteSubmission"]["getById"]>;

const statusColors: Record<SubmissionStatus, string> = {
  PENDING: "bg-yellow-500",
  VERIFIED: "bg-green-500",
  REJECTED: "bg-red-500",
  FLAGGED_ANOMALY: "bg-orange-600",
};

const AIResultDisplay = ({ submission }: { submission: NonNullable<SubmissionObject> }) => {
  const utils = api.useUtils();
  const { mutate: analyze, isPending: isAnalyzing } = api.ai.analyzeSubmission.useMutation({
    onSuccess: async () => {
      await utils.voteSubmission.getById.invalidate({ id: submission.id });
    },
    onError: (error) => {
      alert(`AI Analysis Failed: ${error.message}`);
    },
  });

  if (!submission.aiResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Analysis</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <p>This submission has not been analyzed by the AI yet.</p>
          <Button onClick={() => analyze({ submissionId: submission.id })} disabled={isAnalyzing}>
            {isAnalyzing ? "Analyzing..." : "Run AI Analysis"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { aiResult } = submission;
  const ocrData = aiResult.ocrData as any; // Cast for easier access

  return (
    <Card className={aiResult.isFlagged ? "border-orange-600" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Analysis Result</span>
          <Badge variant={aiResult.isFlagged ? "destructive" : "default"}>
            {aiResult.isFlagged ? "Flagged for Review" : "Looks Good"}
          </Badge>
        </CardTitle>
        <CardDescription>Automated analysis of the declaration form.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold">Legibility</h4>
          <p>{ocrData?.isLegible ? "Form is legible" : "Form may be illegible"}</p>
        </div>
        <div>
          <h4 className="font-semibold">Tampering Signs</h4>
          {ocrData?.tamperingSigns?.length > 0 ? (
            <ul className="list-disc pl-5">
              {ocrData.tamperingSigns.map((sign: string, i: number) => <li key={i}>{sign}</li>)}
            </ul>
          ) : (
            <p>No signs of tampering detected.</p>
          )}
        </div>
        <div>
          <h4 className="font-semibold">Extracted Votes (OCR)</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead className="text-right">Vote Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ocrData?.votes?.map((vote: any, i: number) => (
                <TableRow key={i} className={!vote.candidateId ? "bg-red-100 dark:bg-red-900" : ""}>
                  <TableCell>{vote.candidateName}{!vote.candidateId && " (Unmatched)"}</TableCell>
                  <TableCell className="text-right">{vote.voteCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};


export default function SubmissionDetailPage() {
  const params = useParams();
  const submissionId = params.id as string;

  const { data: submission, isLoading, error } = api.voteSubmission.getById.useQuery({ id: submissionId });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!submission) return <div>Submission not found.</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Submission Details</h1>
        <Badge className={`${statusColors[submission.status]} text-white`}>
          {submission.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Manual Vote Entry</CardTitle>
              <CardDescription>Votes manually entered by the polling agent.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Political Party</TableHead>
                    <TableHead className="text-right">Vote Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submission.votes.map((vote) => (
                    <TableRow key={vote.candidate.id}>
                      <TableCell>{vote.candidate.name}</TableCell>
                      <TableCell>{vote.candidate.politicalParty}</TableCell>
                      <TableCell className="text-right">{vote.voteCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Declaration Form Images</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {submission.declarationFormImages.map((image) => (
                <a key={image.id} href={image.url} target="_blank" rel="noopener noreferrer">
                  <img src={image.url} alt="Declaration form" className="rounded-md object-cover transition-transform hover:scale-105" />
                </a>
              ))}
              {submission.declarationFormImages.length === 0 && <p>No images were uploaded.</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
           <Card>
            <CardHeader>
              <CardTitle>Submission Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Polling Station:</strong> {submission.pollingStation.name}</p>
              <p><strong>Submitted By:</strong> {submission.submittedBy.name ?? submission.submittedBy.email}</p>
              <p><strong>Timestamp:</strong> {new Date(submission.createdAt).toLocaleString()}</p>
            </CardContent>
          </Card>
          <AIResultDisplay submission={submission} />
        </div>
      </div>
    </div>
  );
}