import assert from "node:assert/strict";
import test from "node:test";
import { resolveThemePreference } from "../src/lib/theme.ts";

test("theme preference resolves to dark when stored or browser prefers dark", () => {
	assert.equal(
		resolveThemePreference({
			storedTheme: "dark",
			prefersDark: false,
		}),
		true,
	);
	assert.equal(
		resolveThemePreference({
			storedTheme: null,
			prefersDark: true,
		}),
		true,
	);
	assert.equal(
		resolveThemePreference({
			storedTheme: "light",
			prefersDark: true,
		}),
		false,
	);
});
