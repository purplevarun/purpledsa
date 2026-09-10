import { useAuth } from "../auth/AuthProvider";
import HeaderLeft from "./HeaderLeft";
import HeaderRight from "./HeaderRight";

type HeaderProps = {
	onSync?: () => void;
	syncing?: boolean;
	lastSyncedAt?: string | null;
};

const Header = ({
	onSync,
	syncing = false,
	lastSyncedAt = null,
}: HeaderProps) => {
	const { user } = useAuth();

	return (
		<header className="topbar">
			<HeaderLeft />
			<HeaderRight
				isSignedIn={Boolean(user)}
				onSync={onSync}
				syncing={syncing}
				lastSyncedAt={lastSyncedAt}
			/>
		</header>
	);
};

export default Header;
