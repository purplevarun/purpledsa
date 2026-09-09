import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "../app/AppHeader";
import { supabase, supabaseConfigError } from "../lib/supabase";

type LeaderboardUser = {
	id: string;
	username: string;
	name?: string | null;
};

type ProgressRow = {
	userId: string;
	solved: boolean;
};

type LeaderboardEntry = {
	id: string;
	username: string;
	name?: string | null;
	solvedCount: number;
};

export function LeaderboardPage() {
	const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const load = async () => {
			try {
				setError("");

				if (!supabase) {
					throw new Error(
						`Supabase is not configured. ${supabaseConfigError}`,
					);
				}

				const [
					{ data: users, error: userError },
					{ data: progress, error: progressError },
				] = await Promise.all([
					supabase.from("user").select("id, username, name"),
					supabase.from("progress").select("userId, solved"),
				]);

				if (userError) throw new Error("Could not load users");
				if (progressError) throw new Error("Could not load progress");

				const solvedCountByUserId = new Map<string, number>();
				for (const row of (progress ?? []) as ProgressRow[]) {
					if (!row.solved) continue;
					solvedCountByUserId.set(
						row.userId,
						(solvedCountByUserId.get(row.userId) ?? 0) + 1,
					);
				}

				const next = ((users ?? []) as LeaderboardUser[])
					.map((u) => ({
						id: u.id,
						username: u.username,
						name: u.name,
						solvedCount: solvedCountByUserId.get(u.id) ?? 0,
					}))
					.sort((a, b) => {
						if (b.solvedCount !== a.solvedCount)
							return b.solvedCount - a.solvedCount;
						return a.username.localeCompare(b.username);
					});

				setEntries(next);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Could not load leaderboard",
				);
			} finally {
				setLoading(false);
			}
		};

		load();
	}, []);

	const hasEntries = useMemo(() => entries.length > 0, [entries]);

	return (
		<div className="app-shell">
			<AppHeader />

			<section className="card">
				<h1 style={{ marginTop: 0 }}>Leaderboard</h1>
				<p style={{ color: "var(--muted)" }}>
					Ranking by total solved problems.
				</p>

				{loading && <p>Loading leaderboard...</p>}
				{error && <p style={{ color: "crimson" }}>{error}</p>}

				{!loading && !error && hasEntries && (
					<div
						className="leaderboard-table selectable"
						role="table"
						aria-label="Leaderboard"
					>
						<div className="leaderboard-head" role="row">
							<div>#</div>
							<div>User</div>
							<div>Solved</div>
						</div>
						{entries.map((entry, index) => (
							<div
								className="leaderboard-row"
								role="row"
								key={entry.id}
							>
								<div>{index + 1}</div>
								<div>{entry.name || entry.username}</div>
								<div>{entry.solvedCount}</div>
							</div>
						))}
					</div>
				)}

				{!loading && !error && !hasEntries && (
					<p>No users found yet.</p>
				)}
			</section>
		</div>
	);
}
