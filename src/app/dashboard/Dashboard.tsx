"use client";

import React, { useState } from "react";
import { ElectionManagement } from "./ElectionManagement";
import { CandidateManagement } from "./CandidateManagement";
import { PollingStationManagement } from "./PollingStationManagement";
import { UserManagement } from "./UserManagement";
import { VoteSubmissionManagement } from "./VoteSubmissionManagement";

type Tab = "elections" | "candidates" | "pollingStations" | "users" | "submissions";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("elections");

  const renderContent = () => {
    switch (activeTab) {
      case "elections":
        return <ElectionManagement />;
      case "candidates":
        return <CandidateManagement />;
      case "pollingStations":
        return <PollingStationManagement />;
      case "users":
        return <UserManagement />;
      case "submissions":
        return <VoteSubmissionManagement />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("elections")}
            className={`${
              activeTab === "elections"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
          >
            Elections
          </button>
          <button
            onClick={() => setActiveTab("candidates")}
            className={`${
              activeTab === "candidates"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
          >
            Candidates
          </button>
          <button
            onClick={() => setActiveTab("pollingStations")}
            className={`${
              activeTab === "pollingStations"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
          >
            Polling Stations
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`${
              activeTab === "users"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`${
              activeTab === "submissions"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}
          >
            Submissions
          </button>
        </nav>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
}