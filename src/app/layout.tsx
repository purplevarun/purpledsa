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
        <ThemeProvider attribute="class">
          <Navbar />
          <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-border/70 py-6 text-center text-xs text-muted">
            Built by <a href="https://github.com/purplevarun" target="_blank" rel="noreferrer" className="font-medium text-foreground underline-offset-2 hover:underline">purplevarun</a>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
