import assert from "node:assert";
import { describe, it, mock } from "node:test";
import { showHelp } from "./help.ts";

describe("help", () => {
	describe("showHelp", () => {
		it("should output help message to console", () => {
			const consoleMock = mock.method(console, "log");

			showHelp();

			assert.strictEqual(consoleMock.mock.callCount(), 1);
			const output = consoleMock.mock.calls[0].arguments[0];

			// Verify key components of help message
			assert.ok(output.includes("Usage:"));
			assert.ok(output.includes("sagmal [options] [languages] <text>"));
			assert.ok(output.includes("sagmal [options] <text> [languages]"));
			assert.ok(output.includes("sagmal [options] [language] <text> [language]"));

			consoleMock.mock.restore();
		});

		it("should include all required CLI options", () => {
			const consoleMock = mock.method(console, "log");

			showHelp();

			const output = consoleMock.mock.calls[0].arguments[0];

			assert.ok(output.includes("-c, --copy"));
			assert.ok(output.includes("-h, --help"));

			consoleMock.mock.restore();
		});
	});
});
