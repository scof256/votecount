"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import * as React from "react";

import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const dynamic = "force-dynamic";

function AnalyticsDashboard() {
  // This will be a new endpoint we need to create
  const { data: results, isLoading } = api.voteSubmission.getResults.useQuery();

  if (isLoading) {
    return <p>Loading analytics data...</p>;
  }

  if (!results || results.length === 0) {
    return <p>No verified results available to display.</p>;
  }

  const chartData = results.map((r: any) => ({
    name: r.candidate.name,
    votes: r._sum.voteCount,
  }));

  return (
    <div className="grid grid-cols-1 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Overall Election Results</CardTitle>
          <CardDescription>
            Live vote counts for each candidate across all verified polling stations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="votes" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  // For now, let's allow any logged-in user to see the dashboard.
  // This could be restricted further later.
  const hasAccess = !!user;

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading session...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2">Please log in to view the dashboard.</p>
        <Link href="/sign-in" className="mt-4 text-indigo-600 hover:underline">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <section className="py-12">
        <div>
          <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
          <p className="mt-2 text-lg text-gray-700">
            Real-time overview of the election results.
          </p>
        </div>

        <div className="mt-8">
          <AnalyticsDashboard />
        </div>
      </section>
    </main>
  );
}