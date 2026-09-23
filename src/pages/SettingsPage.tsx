import { FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Header from "../app/Header";
import { useAuth } from "../auth/AuthProvider";

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
