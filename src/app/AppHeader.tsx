import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export function AppHeader() {
	const { user } = useAuth();

	return (
		<header className="topbar">
			<Link to="/" className="brand" aria-label="PurpleDSA Home">
				<img src="/pdsa-icon.svg" alt="PDSA icon" />
				<span>PDSA</span>
			</Link>

			<nav className="nav">
				<Link to="/leaderboard">Leaderboard</Link>
				<Link to="/sets/neetcode-150">NeetCode 150</Link>
				<Link to="/sets/top-interview">Top Interview</Link>
				<Link to="/sets/lld">LLD</Link>
			</nav>

			<div className="auth-box">
				{user ? (
					<Link to="/settings" className="username-chip">
						{user.username}
					</Link>
				) : (
					<Link to="/login">
						<button className="primary">Sign in</button>
					</Link>
				)}
			</div>
		</header>
	);
}
