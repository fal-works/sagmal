/**
 * Determines if two language codes likely represent the same language using simplified matching logic.
 * If language subtags match, treats missing regional subtag as "generic".
 *
 * Examples:
 * - 'en' vs 'en-US' -> true (generic vs regional), although not accurate
 * - 'en-US' vs 'en-GB' -> false (both regional, different)
 */
export function areLikelySameLanguageCodes(lang1: string, lang2: string): boolean {
	const parts1 = lang1.split("-");
	const parts2 = lang2.split("-");

	const maxLength = Math.max(parts1.length, parts2.length);
	for (let i = 0; i < maxLength; i++) {
		const part1 = parts1[i];
		const part2 = parts2[i];

		if (part1 && part2) {
			// If both parts exist, they must match
			if (part1.toLowerCase() !== part2.toLowerCase()) {
				return false;
			}
		} else {
			// If only one part exists consider as equivalent (generic vs regional)
			break;
		}
	}

	return true;
}
