import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { DashboardPage } from "./pages/DashboardPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { LoginPage } from "./pages/LoginPage";
import { ProblemSetPage } from "./pages/ProblemSetPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
	return (
		<AuthProvider>
			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/" element={<DashboardPage />} />
				<Route path="/leaderboard" element={<LeaderboardPage />} />
				<Route path="/settings" element={<SettingsPage />} />
				<Route path="/sets/:slug" element={<ProblemSetPage />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</AuthProvider>
	);
}
