import { homedir } from "node:os";
import { join } from "node:path";
import dotenv from "dotenv";
import { SagmalError } from "./errors.ts";

/**
 * Mutes `console.log` output for a function execution.
 */
function mute(fn: () => void): void {
	const originalLog = console.log;
	console.log = () => {};
	fn();
	console.log = originalLog;
}

/**
 * Loads environment variables from `.env` files.
 */
function loadDotEnv(): void {
	dotenv.config({ path: join(homedir(), ".env") });
	dotenv.config(); // cwd takes precedence over home
}

/**
 * Loads environment variables.
 */
export function loadEnvironment(): void {
	mute(loadDotEnv);
}

/**
 * Gets the DeepL API key from environment variable.
 *
 * @returns API key
 * @throws SagmalError if the key is not found
 */
export function getApiKey(): string {
	const key = process.env.SAGMAL_DEEPL_API_KEY;

	if (!key) {
		throw new SagmalError(
			"DeepL API key not found. Please set SAGMAL_DEEPL_API_KEY as an environment variable or in a .env file.",
		);
	}

	return key;
}
