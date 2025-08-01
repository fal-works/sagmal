import assert from "node:assert";
import { describe, it } from "node:test";
import { parseCliLanguageOption } from "./cli-language-parser.ts";

describe("cli-language-parser", () => {
	describe("parseCliLanguageOption", () => {
		it("should return null for arguments without colon", () => {
			assert.strictEqual(parseCliLanguageOption("hello"), null);
			assert.strictEqual(parseCliLanguageOption("world"), null);
			assert.strictEqual(parseCliLanguageOption("en"), null);
			assert.strictEqual(parseCliLanguageOption(""), null);
		});

		it("should parse source language only", () => {
			const result = parseCliLanguageOption("ja:");
			assert.deepStrictEqual(result, {
				sourceLang: "ja",
				targetLang: null,
			});
		});

		it("should parse target language only", () => {
			const result = parseCliLanguageOption(":en");
			assert.deepStrictEqual(result, {
				sourceLang: null,
				targetLang: "en",
			});
		});

		it("should parse both source and target languages", () => {
			const result = parseCliLanguageOption("ja:en");
			assert.deepStrictEqual(result, {
				sourceLang: "ja",
				targetLang: "en",
			});
		});

		it("should handle complex language codes", () => {
			const result = parseCliLanguageOption("zh-HANT:en-US");
			assert.deepStrictEqual(result, {
				sourceLang: "zh-HANT",
				targetLang: "en-US",
			});
		});

		it("should handle empty colon case", () => {
			const result = parseCliLanguageOption(":");
			assert.deepStrictEqual(result, {
				sourceLang: null,
				targetLang: null,
			});
		});

		it("should return null for multiple colons", () => {
			const result = parseCliLanguageOption("ja:en:fr");
			assert.strictEqual(result, null);
		});

		it("should preserve case in language codes", () => {
			const result = parseCliLanguageOption("JA:En-us");
			assert.deepStrictEqual(result, {
				sourceLang: "JA",
				targetLang: "En-us",
			});
		});
	});
});
