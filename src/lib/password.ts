import crypto from "node:crypto";

const ITERATIONS = 100_000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

export const hashPassword = (password: string): string => {
	const salt = crypto.randomBytes(16).toString("hex");
	const derived = crypto
		.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
		.toString("hex");

	return `${salt}:${derived}`;
};

export const verifyPassword = (
	password: string,
	storedHash: string,
): boolean => {
	const [salt, originalHash] = storedHash.split(":");

	if (!salt || !originalHash) {
		return false;
	}

	const candidate = crypto
		.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
		.toString("hex");

	return crypto.timingSafeEqual(
		Buffer.from(candidate, "hex"),
		Buffer.from(originalHash, "hex"),
	);
};
