import { render, screen } from "@testing-library/react";
import { useUser } from "@clerk/nextjs";
import * as React from "react";

import HomePage from "@/app/page";
import { api } from "@/trpc/react";

// Mock Clerk's hooks and components
jest.mock("@clerk/nextjs", () => ({
  useUser: jest.fn(),
  SignInButton: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  UserButton: () => <div>UserButton</div>, // Simple mock for UserButton
}));

jest.mock("@/trpc/react");

describe("HomePage", () => {
  it("renders the page for unauthenticated users", () => {
    // Arrange
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      user: null,
    });
    const mockUseQuery = jest.fn().mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    });
    (api as any).post = {
      hello: {
        useQuery: mockUseQuery,
      },
    };

    // Act
    render(<HomePage />);

    // Assert
    expect(
      screen.getByRole("heading", { name: /Vote Tallying Application/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/You are not signed in./i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign In/i })
    ).toBeInTheDocument();
  });

  it("renders the page for authenticated users", () => {
    // Arrange
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: {
        primaryEmailAddress: {
          emailAddress: "test@example.com",
        },
        publicMetadata: {
          role: "ADMINISTRATOR",
        },
      },
    });
    const mockUseQuery = jest.fn().mockReturnValue({
      data: { greeting: "Hello from tRPC" },
      isLoading: false,
      isError: false,
    });
    (api as any).post = {
      hello: {
        useQuery: mockUseQuery,
      },
    };

    // Act
    render(<HomePage />);

    // Assert
    expect(
      screen.getByRole("heading", { name: /Vote Tallying Application/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Signed in as/i)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Your role is/i)).toBeInTheDocument();
    expect(screen.getByText(/ADMINISTRATOR/i)).toBeInTheDocument();
    expect(screen.getByText(/UserButton/i)).toBeInTheDocument(); // Check for the mocked UserButton
    expect(screen.getByText(/Hello from tRPC/i)).toBeInTheDocument();
  });
});