import { MoonStar, Search, SunMedium, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
	getStoredTheme,
	resolveThemePreference,
	applyTheme,
} from "../lib/theme";
import { useGlobalSearch } from "./GlobalSearch";

type HeaderRightProps = {
	isSignedIn: boolean;
	onSync?: () => void;
	syncing?: boolean;
	lastSyncedAt?: string | null;
};

const UserIcon = () => {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<circle cx="12" cy="8" r="4" />
			<path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" />
		</svg>
	);
};

const SyncIcon = () => {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M4 4v6h6" />
			<path d="M20 20v-6h-6" />
			<path d="M20 9a8 8 0 0 0-14-3L4 10" />
			<path d="M4 15a8 8 0 0 0 14 3l2-4" />
		</svg>
	);
};

const HeaderRight = ({
	isSignedIn,
	onSync,
	syncing = false,
	lastSyncedAt = null,
}: HeaderRightProps) => {
	const { openSearch, isOpen } = useGlobalSearch();
	const [isDark, setIsDark] = useState(() => {
		const storedTheme = getStoredTheme();
		const prefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)",
		).matches;
		return resolveThemePreference({ storedTheme, prefersDark });
	});

	useEffect(() => {
		applyTheme(isDark);
	}, [isDark]);

	const lastSyncedLabel = lastSyncedAt
		? new Date(lastSyncedAt).toLocaleString()
		: "Never";
	const syncTitle = syncing
		? `Syncing (last synced: ${lastSyncedLabel})`
		: `Sync now (last synced: ${lastSyncedLabel})`;

	return (
		<div className="header-right">
			<button
				type="button"
				className="user-icon-chip"
				onClick={openSearch}
				aria-label="Search"
				title="Search"
				aria-haspopup="dialog"
				aria-expanded={isOpen}
				aria-keyshortcuts="Meta+K Control+K"
			>
				<Search aria-hidden="true" />
			</button>
			<button
				type="button"
				className="user-icon-chip theme-toggle-button"
				onClick={() => setIsDark((current) => !current)}
				aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
				title={isDark ? "Switch to light mode" : "Switch to dark mode"}
				aria-pressed={isDark}
			>
				{isDark ? <SunMedium aria-hidden="true" /> : <MoonStar aria-hidden="true" />}
			</button>
			<Link
				to="/leaderboard"
				className="user-icon-chip"
				aria-label="Leaderboard"
				title="Leaderboard"
			>
				<Trophy aria-hidden="true" />
			</Link>
			{isSignedIn && (
				<button
					type="button"
					className={`sync-icon-button ${syncing ? "syncing" : ""}`}
					onClick={() => onSync?.()}
					disabled={syncing || !onSync}
					aria-label={
						syncing ? "Syncing progress" : "Sync progress now"
					}
					title={
						onSync ? syncTitle : "Sync is available on home page"
					}
				>
					<SyncIcon />
				</button>
			)}
			<Link
				to={isSignedIn ? "/settings" : "/login"}
				className="user-icon-chip"
				aria-label={isSignedIn ? "Open settings" : "Sign in"}
				title={isSignedIn ? "Settings" : "Sign in"}
			>
				<UserIcon />
			</Link>
		</div>
	);
};

export default HeaderRight;
