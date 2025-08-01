import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { SagmalError, stringifyError } from "./errors.ts";

/**
 * DeepL-specific configuration data.
 */
export interface DeepLConfigData {
	/** Source language code */
	sourceLang?: string;
	/** Target language code */
	targetLang?: string;
	/** Secondary default target language code */
	targetLang2?: string;
	/** DeepL API options (formality, context, modelType, etc.) */
	options?: Record<string, unknown>;
}

/**
 * Configuration structure from .sagmalrc.json files.
 */
export interface SagmalRc {
	/** DeepL API configuration */
	deepL?: DeepLConfigData;
	/** Whether to automatically copy translated text to clipboard */
	copyToClipboard?: boolean;
}

/**
 * Configuration inputs loaded from files (no merging applied).
 */
export interface SagmalRcInputs {
	/** Raw config from home directory .sagmalrc.json (empty object if not present) */
	home: SagmalRc;
	/** Raw config from current directory .sagmalrc.json (empty object if not present) */
	local: SagmalRc;
}

/**
 * Reads file content from disk.
 *
 * @param path - Path to the file
 * @returns File content as string
 * @throws SagmalError if file cannot be read
 */
function readFileContent(path: string): string {
	try {
		return readFileSync(path, "utf-8");
	} catch (error) {
		throw new SagmalError(`Cannot read file: ${path}\n  ${stringifyError(error)}`);
	}
}

/**
 * Parses JSON content.
 *
 * @param content - JSON string content
 * @param path - File path for error messages
 * @returns Parsed JSON data
 * @throws SagmalError if JSON is invalid
 */
function parseJson(content: string, path: string): unknown {
	try {
		return JSON.parse(content);
	} catch (error) {
		throw new SagmalError(`Invalid JSON: ${path}\n  ${stringifyError(error)}`);
	}
}

/**
 * Validates and types parsed `.sagmalrc` data.
 *
 * @param parsed - Parsed JSON data
 * @param path - File path for error messages
 * @returns Typed config object
 * @throws SagmalError if data is not a valid config object
 */
function validateSagmalRc(parsed: unknown, path: string): SagmalRc {
	if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
		throw new SagmalError(
			`Invalid config file: ${path}\n  must be an object, not ${Array.isArray(parsed) ? "array" : typeof parsed}`,
		);
	}
	return parsed as SagmalRc;
}

/**
 * Loads and parses a JSON configuration file.
 * Only validates that the result is a plain object (not array or primitive).
 * Does not validate the object's contents - invalid configuration options are passed through.
 *
 * @param path - Path to the JSON file
 * @returns Parsed object or undefined if file doesn't exist
 * @throws SagmalError if file cannot be read, JSON is malformed, or data is not an object
 */
function loadSagmalRc(path: string): SagmalRc | undefined {
	if (!existsSync(path)) {
		return undefined;
	}

	const content = readFileContent(path);
	const parsed = parseJson(content, path);
	return validateSagmalRc(parsed, path);
}

/**
 * Loads configuration files from home and current directories.
 *
 * @returns Configuration inputs (no merging applied, uses empty objects as defaults)
 */
export function loadSagmalRcInputs(): SagmalRcInputs {
	const homeDir = homedir();
	const homeConfig = loadSagmalRc(join(homeDir, ".sagmalrc.json"));
	const localConfig = loadSagmalRc(join(process.cwd(), ".sagmalrc.json"));

	return {
		home: homeConfig ?? {},
		local: localConfig ?? {},
	};
}
