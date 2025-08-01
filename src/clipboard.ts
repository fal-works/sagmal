import { spawn } from "node:child_process";
import { platform as osPlatform } from "node:os";

/**
 * @returns The command to use for clipboard operations based on the platform,
 *   or null if not supported.
 */
function getClipboardCommand(): string | null {
	const platform = osPlatform();
	if (platform === "win32") return "clip";
	if (platform === "darwin") return "pbcopy";
	return null;
}

/**
 * Internal function to copy text to clipboard without error handling.
 * May throw errors that need to be handled by the caller.
 *
 * @param text Text to copy to clipboard.
 */
async function copyToClipboardInternal(text: string): Promise<void> {
	const command = getClipboardCommand();
	if (!command) return;

	return new Promise((resolve, reject) => {
		const proc = spawn(command);
		proc.on("error", reject);
		proc.stdin.write(text, "utf8", (err: unknown) => {
			if (err) return reject(err);
			proc.stdin.end(resolve);
		});
	});
}

/**
 * Copy text to the system clipboard.
 * Errors are silently suppressed - clipboard copy failures are non-fatal.
 * No effect on unsupported platforms or if no clipboard command is available.
 *
 * @param text Text to copy to clipboard.
 */
export async function copyToClipboard(text: string): Promise<void> {
	try {
		await copyToClipboardInternal(text);
	} catch (_error) {
		// Clipboard copy failure is non-fatal, silently continue
	}
}
