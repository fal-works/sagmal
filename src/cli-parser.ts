import { type CliLanguageOptions, parseCliLanguageOption } from "./cli-language-parser.ts";
import { SagmalError } from "./errors.ts";

/**
 * Result of parsing CLI arguments for all options and text.
 */
export interface CliParseResult {
	languageOptions: CliLanguageOptions;
	text: string;
}

/**
 * Checks if CLI arguments contain help option.
 */
export function hasHelpOption(args: string[]): boolean {
	return args.length === 0 || args[0] === "--help" || args[0] === "-h";
}

/**
 * Parses CLI arguments to extract language options and text parts.
 * Handles language options at both first and last positions.
 */
export function parseCliArguments(args: string[]): CliParseResult {
	if (args.length === 0) {
		return {
			languageOptions: {
				first: null,
				last: null,
			},
			text: "",
		};
	}

	const firstLangOptions = parseCliLanguageOption(args[0]);
	const lastLangOptions = args.length > 1 ? parseCliLanguageOption(args[args.length - 1]) : null;

	let textParts = args;
	if (firstLangOptions !== null) {
		textParts = textParts.slice(1);
	}
	if (lastLangOptions !== null && textParts.length > 0) {
		textParts = textParts.slice(0, -1);
	}

	const text = textParts.join(" ");

	if (text.length > 1024) {
		throw new SagmalError(`Text too long: ${text.length} characters (maximum: 1024).`);
	}

	return {
		languageOptions: {
			first: firstLangOptions,
			last: lastLangOptions,
		},
		text: text,
	};
}
