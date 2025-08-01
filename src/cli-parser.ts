import { parseArgs } from "node:util";
import { type CliLanguageOptions, parseCliLanguageOption } from "./cli-language-parser.ts";
import { SagmalError } from "./errors.ts";

/**
 * Result of parsing CLI positional arguments.
 */
interface CliPositionalParseResult {
	languageOptions: CliLanguageOptions;
	text: string;
}

/**
 * Result of parsing CLI arguments for all options and text.
 */
export interface CliParseResult {
	languageOptions: CliLanguageOptions;
	text: string;
	shouldShowHelp: boolean;
}

/**
 * Parses all CLI arguments including options and positionals.
 */
export function parseCliArguments(): CliParseResult {
	const { values, positionals } = parseArgs({
		options: {
			help: {
				type: "boolean",
				short: "h",
			},
		},
		allowPositionals: true,
	});

	const shouldShowHelp = values.help || positionals.length === 0;
	const positionalResult = parseCliPositionals(positionals);

	return {
		...positionalResult,
		shouldShowHelp,
	};
}

/**
 * Parses CLI positional arguments to extract language options and text parts.
 * Handles language options at both first and last positions.
 */
function parseCliPositionals(args: string[]): CliPositionalParseResult {
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
