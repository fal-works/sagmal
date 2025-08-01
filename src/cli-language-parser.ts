/**
 * CLI language options parsed from command line arguments.
 *
 * These are raw parsed values that will be processed by the parameter resolver.
 * Null values indicate that the parameter resolver should cascade to config file values.
 */
export interface CliLanguageOptions {
	/** Source language code (null means: cascade to config file value, or auto-detect if config also null) */
	sourceLang: string | null;
	/** Target language code (null means: cascade to config file value, or 'en-US' if config also null) */
	targetLang: string | null;
}

/**
 * Parses colon-separated language options from a command line argument.
 *
 * Supported formats:
 * - ":en" → source: null (cascade to config), target: "en"
 * - "de:" → source: "de", target: null (cascade to config)
 * - "ja:vi" → source: "ja", target: "vi"
 * - "hello" → default object with null values (not a language option)
 *
 * Empty strings before/after colon are treated as null.
 *
 * @param arg - Command line argument to parse
 * @returns Parsed language options, or null if not a valid language option
 */
export function parseCliLanguageOption(arg: string): CliLanguageOptions | null {
	if (!arg.includes(":")) return null;

	const colonIndex = arg.indexOf(":");
	const beforeColon = arg.substring(0, colonIndex);
	const afterColon = arg.substring(colonIndex + 1);

	return {
		sourceLang: beforeColon || null,
		targetLang: afterColon || null,
	};
}
