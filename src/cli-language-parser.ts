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
 * Returns null if argument doesn't contain exactly one colon.
 */
export function parseCliLanguageOption(arg: string): CliLanguageOptionData | null {
	const parts = arg.split(":");

	// Must have exactly 2 parts (one colon)
	if (parts.length !== 2) return null;

	// Normalize empty parts to null
	return {
		sourceLang: parts[0] || null,
		targetLang: parts[1] || null,
	};
}
