import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/");

  const params = searchParams ? await searchParams : {};
  const error = params.error;

  return (
    <div className="mx-auto max-w-sm space-y-6 text-center">
      <h1 className="text-2xl font-bold">Sign in to PurpleDSA</h1>
      <p className="text-muted text-sm">
        Use your username and password to track progress and climb the leaderboard.
      </p>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-600">
          Invalid username or password.
        </div>
      )}

      <form
        action={async (formData: FormData) => {
          "use server";
          const username = String(formData.get("username") ?? "").trim();
          const password = String(formData.get("password") ?? "");

          if (!username || !password) {
            redirect("/login?error=invalid");
          }

          await signIn("credentials", {
            username,
            password,
            redirectTo: "/",
          });
        }}
        className="space-y-4 rounded-xl border border-border bg-card p-5 text-left"
      >
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none ring-0 focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none ring-0 focus:border-primary"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-primary px-4 py-2.5 font-medium text-primary-foreground hover:opacity-90"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
