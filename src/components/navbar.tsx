import { auth, signOut } from "@/auth";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-slate-950/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-sm text-primary-foreground shadow-lg shadow-sky-500/20">
            P
          </span>
          <span>
            Purple<span className="text-primary">DSA</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm text-muted sm:flex">
          <Link href="/sets/neetcode-150" className="transition-colors hover:text-foreground">
            NeetCode 150
          </Link>
          <Link href="/sets/top-interview" className="transition-colors hover:text-foreground">
            Top Interview
          </Link>
          <Link href="/sets/lld" className="transition-colors hover:text-foreground">
            LLD
          </Link>
          <Link href="/leaderboard" className="transition-colors hover:text-foreground">
            Leaderboard
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          {session?.user ? (
            <div className="flex items-center gap-2">
              {session.user.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name ?? "Profile"}
                  className="h-8 w-8 rounded-full border border-border bg-slate-900/70"
                />
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="glass-button rounded-lg px-3 py-1.5 text-sm text-foreground transition-colors hover:border-sky-300/30"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-lg shadow-sky-500/20 transition-opacity hover:opacity-90"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto px-4 pb-2 text-sm text-muted sm:hidden">
        <Link href="/sets/neetcode-150" className="whitespace-nowrap hover:text-foreground">
          NeetCode 150
        </Link>
        <Link href="/sets/top-interview" className="whitespace-nowrap hover:text-foreground">
          Top Interview
        </Link>
        <Link href="/sets/lld" className="whitespace-nowrap hover:text-foreground">
          LLD
        </Link>
        <Link href="/leaderboard" className="whitespace-nowrap hover:text-foreground">
          Leaderboard
        </Link>
      </nav>
    </header>
  );
}
