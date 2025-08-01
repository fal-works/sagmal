/**
 * Displays usage information and examples to the console.
 * Called when no arguments are provided or when --help/-h flags are used.
 */
export function showHelp(): void {
	const msg = `
Usage:
  sagmal [languages] <text>
Examples:
  sagmal Bonjour tout le monde
  sagmal de: Hallo Welt!
  sagmal :it It's not a bug, it's a feature
  sagmal I have made a terrible mistake :ja
  sagmal fr:ar Je pense, donc je suis
  sagmal ja: 私は大丈夫です :zh-HANT
  sagmal 404 Motivation Not Found en:de
`.trim();

	console.log(msg);
}
