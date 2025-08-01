/**
 * Displays usage information and examples to the console.
 * Called when no arguments are provided or when --help/-h flags are used.
 */
export function showHelp(): void {
	const msg = `
Usage:
  sagmal [languages] <text>
Examples:
  sagmal Hallo, Welt!
  sagmal ja: 私は大丈夫です
  sagmal :it It's not a bug, it's a feature
  sagmal fr:la Je pense, donc je suis
`.trim();

	console.log(msg);
}
