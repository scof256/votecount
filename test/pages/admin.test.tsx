import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import * as React from "react";
import { useUser } from "@clerk/nextjs";

import AdminDashboardPage from "@/app/admin/page";
import { api } from "@/trpc/react";

// Mock the useUser hook
jest.mock("@clerk/nextjs", () => ({
  useUser: jest.fn(),
}));

// Mock the next/link component
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock the tRPC api
jest.mock("@/trpc/react", () => ({
  api: {
    election: {
      getAllElections: {
        useQuery: jest.fn(),
      },
      createElection: {
        useMutation: jest.fn(),
      },
    },
    useUtils: jest.fn(),
  },
}));

describe("AdminDashboardPage", () => {
  it("renders the dashboard for an administrator", () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: {
        publicMetadata: { role: "ADMINISTRATOR" },
      },
    });

    // Provide mock implementations for the tRPC hooks
    (api.election.getAllElections.useQuery as jest.Mock).mockReturnValue({
      data: [
        {
          id: "1",
          name: "General Election 2024",
          date: new Date(),
          positions: [],
        },
      ],
      isLoading: false,
    });
    (api.election.createElection.useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
    (api.useUtils as jest.Mock).mockReturnValue({
      election: {
        getAllElections: {
          invalidate: jest.fn(),
        },
      },
    });

    render(<AdminDashboardPage />);

    expect(
      screen.getByRole("heading", { name: /admin dashboard/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /existing elections/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/general election 2024/i)).toBeInTheDocument();
  });

  it("renders an access denied message for a non-administrator", () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: {
        publicMetadata: { role: "POLLING_AGENT" },
      },
    });

    render(<AdminDashboardPage />);

    expect(
      screen.getByRole("heading", { name: /access denied/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/you do not have permission to view this page/i),
    ).toBeInTheDocument();
  });

  it("renders an access denied message for a user with no role", () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: {
        publicMetadata: {},
      },
    });

    render(<AdminDashboardPage />);

    expect(
      screen.getByRole("heading", { name: /access denied/i }),
    ).toBeInTheDocument();
  });
});