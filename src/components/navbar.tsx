import { auth, signOut } from "@/auth";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            P
          </span>
          <span>
            Purple<span className="text-primary">DSA</span>
          </span>
        </Link>
        <nav className="hidden sm:flex items-center gap-4 text-sm text-muted">
          <Link href="/sets/neetcode-150" className="hover:text-foreground">
            NeetCode 150
          </Link>
          <Link href="/sets/top-interview" className="hover:text-foreground">
            Top Interview
          </Link>
          <Link href="/sets/lld" className="hover:text-foreground">
            LLD
          </Link>
          <Link href="/leaderboard" className="hover:text-foreground">
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
                  className="h-8 w-8 rounded-full border border-border"
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
                  className="rounded-md border border-border px-3 py-1.5 text-sm hover:border-primary"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
      <nav className="flex sm:hidden gap-4 overflow-x-auto px-4 pb-2 text-sm text-muted">
        <Link href="/sets/neetcode-150" className="hover:text-foreground">
          NeetCode 150
        </Link>
        <Link href="/sets/top-interview" className="hover:text-foreground">
          Top Interview
        </Link>
        <Link href="/sets/lld" className="hover:text-foreground">
          LLD
        </Link>
        <Link href="/leaderboard" className="hover:text-foreground">
          Leaderboard
        </Link>
      </nav>
    </header>
  );
}
