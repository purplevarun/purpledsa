export type ThemeMode = "light" | "dark";

export type ResolveThemePreferenceArgs = {
	storedTheme: string | null;
	prefersDark: boolean;
};

export const resolveThemePreference = ({
	storedTheme,
	prefersDark,
}: ResolveThemePreferenceArgs): boolean => {
	if (storedTheme === "dark") return true;
	if (storedTheme === "light") return false;
	return prefersDark;
};

export const getStoredTheme = (): ThemeMode | null => {
	if (typeof window === "undefined") return null;
	const theme = window.localStorage.getItem("theme");
	if (theme === "dark" || theme === "light") return theme;
	return null;
};

export const applyTheme = (isDark: boolean) => {
	if (typeof document === "undefined") return;
	const root = document.documentElement;
	root.classList.toggle("dark", isDark);
	root.style.colorScheme = isDark ? "dark" : "light";
	window.localStorage.setItem("theme", isDark ? "dark" : "light");
};
