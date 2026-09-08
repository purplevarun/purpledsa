import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PurpleDSA — Track your DSA interview prep",
  description:
    "Track NeetCode 150 and Top Interview Questions, compete on the leaderboard, and land your next SWE role.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-border py-6 text-center text-xs text-muted">
            Built with PurpleDSA · Track NeetCode 150 &amp; Top Interview Questions
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
