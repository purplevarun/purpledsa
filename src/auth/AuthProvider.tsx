import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase, supabaseConfigError } from "../lib/supabase";

const SUPABASE_ENV_HELP =
	"Set VITE_PUBLIC_SUPABASE_URL/VITE_PUBLIC_SUPABASE_ANON_KEY (or VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY).";

type User = {
	id: string;
	username: string;
	leetcodeUsername?: string | null;
	name?: string | null;
};

type AuthContextType = {
	user: User | null;
	loading: boolean;
	checkUsernameExists: (username: string) => Promise<boolean>;
	signIn: (username: string, password: string) => Promise<void>;
	signUp: (username: string, password: string) => Promise<void>;
	updateLeetCodeUsername: (leetcodeUsername: string) => Promise<void>;
	signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const bootstrap = async () => {
			try {
				const saved = localStorage.getItem("purpledsa-user");
				if (saved) setUser(JSON.parse(saved));
			} catch {
				setUser(null);
			} finally {
				setLoading(false);
			}
		};
		bootstrap();
	}, []);

	const checkUsernameExists = async (username: string) => {
		const cleanUsername = username.trim();
		if (!cleanUsername) throw new Error("Username required");

		if (!supabase) {
			throw new Error(
				`Supabase is not configured. ${supabaseConfigError} ${SUPABASE_ENV_HELP}`,
			);
		}

		const { data, error } = await supabase
			.from("user")
			.select("id")
			.eq("username", cleanUsername)
			.limit(1);

		if (error) {
			const detail = (error.message || "").toLowerCase();
			if (
				detail.includes("permission denied") ||
				detail.includes("row-level security")
			) {
				throw new Error(
					'Unable to verify user. Supabase permissions/policies are missing for table "user". Run the SQL in supabase-schema.sql in this Supabase project.',
				);
			}
			throw new Error(`Unable to verify user. ${error.message}`);
		}
		return (data?.length ?? 0) > 0;
	};

	const signIn = async (username: string, password: string) => {
		const cleanUsername = username.trim();
		if (!cleanUsername || !password)
			throw new Error("Username and password required");
		if (!supabase) {
			throw new Error(
				`Supabase is not configured. ${supabaseConfigError} ${SUPABASE_ENV_HELP}`,
			);
		}

		const { data, error } = await supabase
			.from("user")
			.select("*")
			.eq("username", cleanUsername)
			.single();

		if (error) {
			const detail = (error.message || "").toLowerCase();
			if (
				detail.includes("permission denied") ||
				detail.includes("row-level security")
			) {
				throw new Error(
					'Unable to sign in. Supabase permissions/policies are missing for table "user". Run the SQL in supabase-schema.sql in this Supabase project.',
				);
			}
			throw new Error("Invalid username or password");
		}

		if (!data) throw new Error("Invalid username or password");

		const hash = data.passwordHash ?? "";
		if (!hash) throw new Error("Invalid username or password");

		const isValid = await comparePassword(password, hash);
		if (!isValid) throw new Error("Invalid username or password");

		const nextUser = {
			id: data.id,
			username: data.username,
			leetcodeUsername: data.leetcodeUsername,
			name: data.name,
		};
		setUser(nextUser);
		localStorage.setItem("purpledsa-user", JSON.stringify(nextUser));
	};

	const signUp = async (username: string, password: string) => {
		const cleanUsername = username.trim();

		if (!cleanUsername || !password)
			throw new Error("Username and password required");
		if (cleanUsername.length < 3)
			throw new Error("Username must be at least 3 characters");
		if (password.length < 6)
			throw new Error("Password must be at least 6 characters");

		if (!supabase) {
			throw new Error(
				`Supabase is not configured. ${supabaseConfigError} ${SUPABASE_ENV_HELP}`,
			);
		}

		const passwordHash = await hashPassword(password);
		const nextUser = {
			id: crypto.randomUUID(),
			username: cleanUsername,
			leetcodeUsername: cleanUsername,
			name: cleanUsername,
			passwordHash,
		};

		const { error } = await supabase.from("user").insert(nextUser);
		if (error) {
			if (error.code === "23505") {
				throw new Error("Username already exists");
			}
			const detail = (error.message || "").toLowerCase();
			if (
				detail.includes("permission denied") ||
				detail.includes("row-level security")
			) {
				throw new Error(
					'Could not create account. Supabase permissions/policies are missing for table "user". Run the SQL in supabase-schema.sql in this Supabase project.',
				);
			}
			throw new Error("Could not create account");
		}

		const sessionUser = {
			id: nextUser.id,
			username: nextUser.username,
			leetcodeUsername: nextUser.leetcodeUsername,
			name: nextUser.name,
		};

		setUser(sessionUser);
		localStorage.setItem("purpledsa-user", JSON.stringify(sessionUser));
	};

	const updateLeetCodeUsername = async (leetcodeUsername: string) => {
		if (!user) throw new Error("You must be signed in");

		const cleanLeetCodeUsername = leetcodeUsername.trim();
		if (!cleanLeetCodeUsername) {
			throw new Error("LeetCode username is required");
		}

		if (!supabase) {
			throw new Error(
				`Supabase is not configured. ${supabaseConfigError} ${SUPABASE_ENV_HELP}`,
			);
		}

		const { error } = await supabase
			.from("user")
			.update({ leetcodeUsername: cleanLeetCodeUsername })
			.eq("id", user.id);

		if (error) {
			const detail = (error.message || "").toLowerCase();
			if (
				detail.includes("permission denied") ||
				detail.includes("row-level security")
			) {
				throw new Error(
					'Could not update settings. Supabase permissions/policies are missing for table "user". Run the SQL in supabase-schema.sql in this Supabase project.',
				);
			}
			throw new Error("Could not update settings");
		}

		const nextUser = {
			...user,
			leetcodeUsername: cleanLeetCodeUsername,
		};
		setUser(nextUser);
		localStorage.setItem("purpledsa-user", JSON.stringify(nextUser));
	};

	const signOut = async () => {
		setUser(null);
		localStorage.removeItem("purpledsa-user");
	};

	const value = useMemo(
		() => ({
			user,
			loading,
			checkUsernameExists,
			signIn,
			signUp,
			updateLeetCodeUsername,
			signOut,
		}),
		[user, loading],
	);

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};

const comparePassword = async (input: string, hash: string) => {
	return (await hashPassword(input)) === hash;
};

const hashPassword = async (input: string) => {
	const text = new TextEncoder().encode(input);
	const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", text));
	return Array.from(bytes)
		.map((x) => x.toString(16).padStart(2, "0"))
		.join("");
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within AuthProvider");
	return context;
};
