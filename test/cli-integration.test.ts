import assert from "node:assert";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { describe, it } from "node:test";

describe("CLI Integration", () => {
	const binPath = join(process.cwd(), "dist", "bin.js");

	/**
	 * Helper function to run the CLI application and capture its output.
	 *
	 * Spawns a Node.js child process to execute the compiled CLI binary with the provided arguments.
	 * This simulates running the CLI tool from the command line and captures all output streams.
	 *
	 * @param args - Command line arguments to pass to the CLI application
	 * @returns Promise resolving to an object containing:
	 *   - stdout: Standard output as a string
	 *   - stderr: Standard error output as a string
	 *   - code: Process exit code (0 for success, non-zero for failure)
	 */
	async function runCli(
		args: string[],
	): Promise<{ stdout: string; stderr: string; exitCode: number }> {
		return new Promise((resolve) => {
			const child = spawn("node", [binPath, ...args], {
				stdio: ["pipe", "pipe", "pipe"], // Pipe stdin, stdout, stderr for output capture
			});

			let stdout = "";
			let stderr = "";

			child.stdout.on("data", (data) => {
				stdout += data.toString();
			});

			child.stderr.on("data", (data) => {
				stderr += data.toString();
			});

			child.on("close", (exitCode) => {
				resolve({ stdout, stderr, exitCode: exitCode ?? 0 });
			});
		});
	}

	it("should show help when no arguments provided", async () => {
		const result = await runCli([]);

		assert.strictEqual(result.exitCode, 0);
		assert.ok(result.stdout.includes("Usage:"));
		assert.ok(result.stdout.includes("sagmal [options]"));
	});

	it("should show help with --help flag", async () => {
		const result = await runCli(["--help"]);

		assert.strictEqual(result.exitCode, 0);
		assert.ok(result.stdout.includes("Usage:"));
		assert.ok(result.stdout.includes("sagmal [options]"));
	});

	it("should show help with -h flag", async () => {
		const result = await runCli(["-h"]);

		assert.strictEqual(result.exitCode, 0);
		assert.ok(result.stdout.includes("Usage:"));
		assert.ok(result.stdout.includes("sagmal [options]"));
	});

	it("should translate simple text", async () => {
		const result = await runCli(["Deutsch"]);

		assert.strictEqual(result.exitCode, 0);
		assert.ok(result.stdout.trim() === "German");
		assert.strictEqual(result.stderr, "");
	});

	it("should parse language options correctly", async () => {
		const result = await runCli(["ja:", "hello", "world"]);

		assert.strictEqual(result.exitCode, 0);
		assert.ok(result.stdout.trim().length > 0);
		assert.strictEqual(result.stderr, "");
	});

	it("should handle conflicting language options", async () => {
		const result = await runCli(["ja:en", "hello", "fr:de"]);

		assert.notStrictEqual(result.exitCode, 0);
		assert.ok(
			result.stderr.includes("Conflicting source languages") ||
				result.stderr.includes("Conflicting target languages"),
		);
	});

	it("should handle copy flag without error in parsing", async () => {
		const result = await runCli(["-c", "hello"]);

		assert.strictEqual(result.exitCode, 0);
		assert.ok(result.stdout.trim().length > 0);
		assert.strictEqual(result.stderr, "");
	});

	it("should handle multiple flags together", async () => {
		const result = await runCli(["-c", "--help"]);

		// Help should take precedence
		assert.strictEqual(result.exitCode, 0);
		assert.ok(result.stdout.includes("Usage:"));
	});

	it("should handle empty text after language option", async () => {
		const result = await runCli(["ja:"]);

		// Should show help due to empty text
		assert.strictEqual(result.exitCode, 0);
		assert.ok(result.stdout.includes("Usage:"));
		assert.ok(result.stdout.includes("sagmal [options]"));
	});
});
