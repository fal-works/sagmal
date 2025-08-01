import assert from "node:assert";
import { describe, it } from "node:test";
import { SagmalError, stringifyError } from "./errors.ts";

describe("errors", () => {
	describe("SagmalError", () => {
		it("should create error with message", () => {
			const error = new SagmalError("Test error message");

			assert.strictEqual(error.name, "SagmalError");
			assert.strictEqual(error.message, "Test error message");
			assert.ok(error instanceof Error);
			assert.ok(error instanceof SagmalError);
		});

		it("should have proper stack trace", () => {
			const error = new SagmalError("Test error");

			assert.ok(error.stack);
			assert.ok(error.stack.includes("SagmalError"));
			assert.ok(error.stack.includes("Test error"));
		});

		it("should have proper stack trace when thrown and caught", () => {
			function throwError() {
				throw new SagmalError("Thrown error message");
			}

			let caughtError: SagmalError | undefined;
			try {
				throwError();
			} catch (error) {
				caughtError = error as SagmalError;
			}

			assert.ok(caughtError);
			assert.ok(caughtError.stack);
			assert.ok(caughtError.stack.includes("SagmalError"));
			assert.ok(caughtError.stack.includes("Thrown error message"));
			assert.ok(caughtError.stack.includes("throwError")); // Should show the actual throw location
		});
	});

	describe("stringifyError", () => {
		it("should handle Error objects", () => {
			const error = new Error("Test error message");
			const result = stringifyError(error);

			assert.strictEqual(result, "Error > Test error message");
		});

		it("should handle SagmalError objects", () => {
			const error = new SagmalError("Sagmal specific error");
			const result = stringifyError(error);

			assert.strictEqual(result, "SagmalError > Sagmal specific error");
		});

		it("should handle string values", () => {
			const result = stringifyError("Simple string error");

			assert.strictEqual(result, "Simple string error");
		});

		it("should handle number values", () => {
			const result = stringifyError(42);

			assert.strictEqual(result, "42");
		});

		it("should handle boolean values", () => {
			assert.strictEqual(stringifyError(true), "true");
			assert.strictEqual(stringifyError(false), "false");
		});

		it("should handle null and undefined", () => {
			assert.strictEqual(stringifyError(null), "null");
			assert.strictEqual(stringifyError(undefined), "undefined");
		});

		it("should handle arrays", () => {
			const arr = ["error", "details"];
			const result = stringifyError(arr);

			assert.strictEqual(result, "error,details");
		});

		it("should handle objects", () => {
			const obj = { code: "ERR001", details: "Something went wrong" };
			const result = stringifyError(obj);

			assert.strictEqual(result, "[object Object]");
		});

		it("should handle circular references in objects", () => {
			const obj: any = { name: "circular" };
			obj.self = obj;

			const result = stringifyError(obj);

			assert.strictEqual(typeof result, "string");
			assert.strictEqual(result, "[object Object]");
		});
	});
});
