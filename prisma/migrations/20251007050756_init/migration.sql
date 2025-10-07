-- CreateEnum
CREATE TYPE "Role" AS ENUM ('POLLING_AGENT', 'SUPERVISOR', 'ADMINISTRATOR');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'VERIFIED', 'FLAGGED_ANOMALY', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'POLLING_AGENT',
    "assignedPollingStationId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollingStation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PollingStation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Election" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Election_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "politicalParty" TEXT,
    "positionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoteSubmission" (
    "id" TEXT NOT NULL,
    "pollingStationId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoteSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateVote" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "voteCount" INTEGER NOT NULL,

    CONSTRAINT "CandidateVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIResult" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "ocrData" JSONB,
    "benfordTestResult" DOUBLE PRECISION,
    "dipTestResult" DOUBLE PRECISION,
    "skewness" DOUBLE PRECISION,
    "kurtosis" DOUBLE PRECISION,
    "incrementalFraudProb" DOUBLE PRECISION,
    "extremeFraudProb" DOUBLE PRECISION,
    "anomalyScore" DOUBLE PRECISION,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_assignedPollingStationId_key" ON "User"("assignedPollingStationId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateVote_submissionId_candidateId_key" ON "CandidateVote"("submissionId", "candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "AIResult_submissionId_key" ON "AIResult"("submissionId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_assignedPollingStationId_fkey" FOREIGN KEY ("assignedPollingStationId") REFERENCES "PollingStation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteSubmission" ADD CONSTRAINT "VoteSubmission_pollingStationId_fkey" FOREIGN KEY ("pollingStationId") REFERENCES "PollingStation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteSubmission" ADD CONSTRAINT "VoteSubmission_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteSubmission" ADD CONSTRAINT "VoteSubmission_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateVote" ADD CONSTRAINT "CandidateVote_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "VoteSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateVote" ADD CONSTRAINT "CandidateVote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "VoteSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIResult" ADD CONSTRAINT "AIResult_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "VoteSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
