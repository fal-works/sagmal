import assert from "node:assert";
import { describe, test } from "node:test";
import { areLikelySameLanguageCodes } from "./language-code.ts";

describe("language-code", () => {
	describe("areLikelySameLanguageCodes", () => {
		test("should return true for identical language codes", () => {
			assert.strictEqual(areLikelySameLanguageCodes("en", "en"), true);
			assert.strictEqual(areLikelySameLanguageCodes("en-US", "en-US"), true);
			assert.strictEqual(areLikelySameLanguageCodes("zh-Hans", "zh-Hans"), true);
		});

		test("should return true for generic vs regional variants", () => {
			assert.strictEqual(areLikelySameLanguageCodes("pt", "pt-BR"), true);
			assert.strictEqual(areLikelySameLanguageCodes("pt-BR", "pt"), true);
			assert.strictEqual(areLikelySameLanguageCodes("en", "en-US"), true);
			assert.strictEqual(areLikelySameLanguageCodes("en-US", "en"), true);
			assert.strictEqual(areLikelySameLanguageCodes("zh", "zh-Hans"), true);
			assert.strictEqual(areLikelySameLanguageCodes("zh-Hans", "zh"), true);
		});

		test("should return false for different primary languages", () => {
			assert.strictEqual(areLikelySameLanguageCodes("en", "fr"), false);
			assert.strictEqual(areLikelySameLanguageCodes("en-US", "fr-FR"), false);
			assert.strictEqual(areLikelySameLanguageCodes("ja", "zh-Hans"), false);
		});

		test("should return false for different regional variants", () => {
			assert.strictEqual(areLikelySameLanguageCodes("en-US", "en-GB"), false);
			assert.strictEqual(areLikelySameLanguageCodes("zh-Hans", "zh-Hant"), false);
			assert.strictEqual(areLikelySameLanguageCodes("pt-BR", "pt-PT"), false);
		});

		test("should be case insensitive", () => {
			assert.strictEqual(areLikelySameLanguageCodes("EN", "en"), true);
			assert.strictEqual(areLikelySameLanguageCodes("EN-US", "en-us"), true);
			assert.strictEqual(areLikelySameLanguageCodes("zh-HANS", "zh-hans"), true);
		});

		test("should handle mixed case scenarios", () => {
			assert.strictEqual(areLikelySameLanguageCodes("EN", "en-US"), true);
			assert.strictEqual(areLikelySameLanguageCodes("pt-BR", "PT"), true);
			assert.strictEqual(areLikelySameLanguageCodes("EN-US", "en-GB"), false);
		});

		test("should handle edge cases", () => {
			// Empty strings
			assert.strictEqual(areLikelySameLanguageCodes("", ""), true);

			// Single character languages
			assert.strictEqual(areLikelySameLanguageCodes("a", "a"), true);
			assert.strictEqual(areLikelySameLanguageCodes("a", "b"), false);
			assert.strictEqual(areLikelySameLanguageCodes("a", "a-B"), true);
		});

		test("should handle complex language codes", () => {
			// Hypothetical multi-part codes
			assert.strictEqual(areLikelySameLanguageCodes("x-y-z", "x-y"), true);
			assert.strictEqual(areLikelySameLanguageCodes("x-y", "x-y-z"), true);
			assert.strictEqual(areLikelySameLanguageCodes("x-y-z", "x-y-w"), false);
		});
	});
});
