import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import NextAuthSessionProvider from "@/components/SessionProvider";
import { TRPCReactProvider } from "@/trpc/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Election Vote Tallying",
  description: "A secure and transparent vote tallying application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthSessionProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}