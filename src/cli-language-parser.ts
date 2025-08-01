/**
 * Single language option data from CLI argument.
 */
export interface CliLanguageOptionData {
	sourceLang: string | null;
	targetLang: string | null;
}

/**
 * All CLI language options parsed from command line arguments.
 */
export interface CliLanguageOptions {
	first: CliLanguageOptionData | null;
	last: CliLanguageOptionData | null;
}

/**
 * Parses colon-separated language options from a command line argument.
 * Returns null if argument doesn't contain colon.
 */
export function parseCliLanguageOption(arg: string): CliLanguageOptionData | null {
	if (!arg.includes(":")) {
		return null;
	}

	const colonIndex = arg.indexOf(":");
	const beforeColon = arg.substring(0, colonIndex);
	const afterColon = arg.substring(colonIndex + 1);

	return {
		sourceLang: beforeColon || null,
		targetLang: afterColon || null,
	};
}
