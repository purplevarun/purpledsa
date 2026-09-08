import assert from "node:assert/strict";
import test from "node:test";

import { hashPassword, verifyPassword } from "../src/lib/password.ts";

test("hash and verify password succeeds for valid credentials", () => {
	const password = "super-secret-pass";
	const hash = hashPassword(password);

	assert.equal(verifyPassword(password, hash), true);
	assert.equal(verifyPassword("wrong-password", hash), false);
});
