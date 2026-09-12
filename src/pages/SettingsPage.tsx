import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Header from "../app/Header";
import { useAuth } from "../auth/AuthProvider";
import { FREE_PRACTICE_SET_SLUG, getProblemSet } from "../data/problemSets";
import { getPracticePlatform, practicePlatforms } from "../lib/links";

const freePracticeSet = getProblemSet(FREE_PRACTICE_SET_SLUG);
const freeProblems =
	freePracticeSet?.topics.flatMap((topic) => topic.problems) ?? [];
const platformCounts = practicePlatforms
	.map((platform) => ({
		...platform,
		count: freeProblems.filter(
			(problem) => getPracticePlatform(problem.url)?.id === platform.id,
		).length,
	}))
	.filter((platform) => platform.count > 0);

export const SettingsPage = () => {
	const { user, loading, updateLeetCodeUsername, signOut } = useAuth();
	const [leetcodeUsername, setLeetcodeUsername] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	useEffect(() => {
		if (!user) return;
		setLeetcodeUsername(user.leetcodeUsername || user.username);
	}, [user]);

	if (!loading && !user) {
		return <Navigate to="/login" replace />;
	}

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		try {
			setSaving(true);
			setError("");
			setSuccess("");
			await updateLeetCodeUsername(leetcodeUsername);
			setSuccess("Settings saved.");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Could not save settings",
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="app-shell">
			<Header />
			<main className="settings-content">
				<div className="settings-heading">
					<h1>Settings</h1>
					<p className="selectable">{user?.username}</p>
				</div>

				<section
					className="settings-section"
					aria-labelledby="practice-platforms-heading"
				>
					<div className="settings-section-heading">
						<div>
							<h2 id="practice-platforms-heading">
								Free Practice Platforms
							</h2>
							<p>
								{freePracticeSet?.title}: {freeProblems.length}{" "}
								exercises across{" "}
								{freePracticeSet?.topics.length} topics.
							</p>
						</div>
						<Link to={`/sets/${FREE_PRACTICE_SET_SLUG}`}>
							Open collection
						</Link>
					</div>
					<p className="practice-access-note">
						No paid subscription required. A free platform account
						may be needed to submit. Paid courses, editorials, and
						AI tools are not included.
					</p>
					<table className="practice-platform-table">
						<caption className="visually-hidden">
							Platforms in Free DSA Essentials
						</caption>
						<thead>
							<tr>
								<th scope="col">Platform</th>
								<th scope="col">Exercises</th>
								<th scope="col">Progress</th>
							</tr>
						</thead>
						<tbody>
							{platformCounts.map((platform) => (
								<tr key={platform.id}>
									<th scope="row">
										<a
											href={platform.url}
											target="_blank"
											rel="noreferrer"
										>
											{platform.name}
										</a>
										<span className="platform-focus">
											{platform.focus}
										</span>
									</th>
									<td>
										<Link
											to={`/sets/${FREE_PRACTICE_SET_SLUG}?platform=${platform.id}`}
											aria-label={`${platform.count} ${platform.name} exercises`}
										>
											{platform.count}
										</Link>
									</td>
									<td>
										{platform.id === "leetcode"
											? "Sync"
											: "Manual"}
									</td>
								</tr>
							))}
						</tbody>
					</table>
					<p className="practice-access-note">
						LeetCode supports automatic progress sync. Mark other
						platforms' exercises as solved manually. SPOJ may
						require browser verification.
					</p>
				</section>

				<section
					className="settings-section"
					aria-labelledby="leetcode-sync-heading"
				>
					<h2 id="leetcode-sync-heading">LeetCode Sync</h2>
					<form onSubmit={onSubmit} className="settings-form">
						<div className="settings-field">
							<label htmlFor="leetcode-username">
								LeetCode username
							</label>
							<input
								id="leetcode-username"
								value={leetcodeUsername}
								onChange={(e) =>
									setLeetcodeUsername(e.target.value)
								}
								disabled={saving}
								placeholder={
									user?.username || "your-leetcode-username"
								}
							/>
						</div>

						{error && (
							<div role="alert" style={{ color: "crimson" }}>
								{error}
							</div>
						)}
						{success && (
							<div role="status" style={{ color: "green" }}>
								{success}
							</div>
						)}

						<div className="settings-actions">
							<button
								type="submit"
								className="primary"
								disabled={saving}
							>
								{saving ? "Saving..." : "Save username"}
							</button>
						</div>
					</form>
				</section>

				<section
					className="settings-section"
					aria-labelledby="account-heading"
				>
					<h2 id="account-heading">Account</h2>
					<button type="button" onClick={() => signOut()}>
						Sign out
					</button>
				</section>
			</main>
		</div>
	);
};
