import { render, screen } from "@testing-library/react";
import { useSession } from "next-auth/react";
import * as React from "react";

import HomePage from "@/app/page";
import { api } from "@/trpc/react";

jest.mock("next-auth/react");
jest.mock("@/trpc/react");

describe("HomePage", () => {
  it("renders the page for unauthenticated users", () => {
    // Arrange
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
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
      screen.getByRole("link", { name: /Sign In/i })
    ).toBeInTheDocument();
  });

  it("renders the page for authenticated users", () => {
    // Arrange
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          email: "test@example.com",
          role: "admin",
        },
      },
      status: "authenticated",
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
    expect(
      screen.getByText((content, node) => {
        const textContent = node?.textContent?.replace(/\s+/g, " ").trim();
        return textContent === "Signed in as test@example.com";
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText((content, node) => {
        const textContent = node?.textContent?.replace(/\s+/g, " ").trim();
        return textContent === "Your role is: admin";
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign Out/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Hello from tRPC/i)).toBeInTheDocument();
  });
});