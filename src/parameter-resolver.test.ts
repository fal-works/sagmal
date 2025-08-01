import assert from "node:assert";
import { describe, it } from "node:test";
import { resolveParameters } from "./parameter-resolver.ts";

describe("parameter-resolver", () => {
	describe("resolveParameters", () => {
		const emptyConfig = {
			home: {},
			local: {},
		};

		it("should use default values when no inputs provided", () => {
			const result = resolveParameters({ first: null, last: null }, emptyConfig, false);

			assert.strictEqual(result.sourceLanguage, null);
			assert.strictEqual(result.targetLanguage, "en-US");
			assert.strictEqual(result.shouldCopyToClipboard, false);
			assert.deepStrictEqual(result.translationOptions, {});
		});

		it("should resolve CLI language options", () => {
			const firstLang = { sourceLang: "ja", targetLang: null };
			const lastLang = { sourceLang: null, targetLang: "fr" };

			const result = resolveParameters({ first: firstLang, last: lastLang }, emptyConfig, false);

			assert.strictEqual(result.sourceLanguage, "ja");
			assert.strictEqual(result.targetLanguage, "fr");
		});

		it("should prioritize last language option over first when no conflict", () => {
			const firstLang = { sourceLang: "ja", targetLang: null };
			const lastLang = { sourceLang: null, targetLang: "de" };

			const result = resolveParameters({ first: firstLang, last: lastLang }, emptyConfig, false);

			assert.strictEqual(result.sourceLanguage, "ja");
			assert.strictEqual(result.targetLanguage, "de");
		});

		it("should throw error for conflicting source languages", () => {
			const firstLang = { sourceLang: "ja", targetLang: null };
			const lastLang = { sourceLang: "fr", targetLang: null };

			assert.throws(() => {
				resolveParameters({ first: firstLang, last: lastLang }, emptyConfig, false);
			}, /Conflicting source languages: 'ja' and 'fr'/);
		});

		it("should throw error for conflicting target languages", () => {
			const firstLang = { sourceLang: null, targetLang: "en" };
			const lastLang = { sourceLang: null, targetLang: "fr" };

			assert.throws(() => {
				resolveParameters({ first: firstLang, last: lastLang }, emptyConfig, false);
			}, /Conflicting target languages: 'en' and 'fr'/);
		});

		it("should normalize 'en' to 'en-US'", () => {
			const config = {
				home: { deepL: { targetLang: "en" } },
				local: {},
			};

			const result = resolveParameters({ first: null, last: null }, config, false);

			assert.strictEqual(result.targetLanguage, "en-US");
		});

		it("should normalize 'EN' to 'en-US' (case insensitive)", () => {
			const config = {
				home: { deepL: { targetLang: "EN" } },
				local: {},
			};

			const result = resolveParameters({ first: null, last: null }, config, false);

			assert.strictEqual(result.targetLanguage, "en-US");
		});

		it("should use cascading priority for source language", () => {
			const config = {
				home: { deepL: { sourceLang: "ja" } },
				local: { deepL: { sourceLang: "fr" } },
			};

			// CLI overrides config
			const resultCli = resolveParameters(
				{ first: { sourceLang: "de", targetLang: null }, last: null },
				config,
				false,
			);
			assert.strictEqual(resultCli.sourceLanguage, "de");

			// Local config overrides home config
			const resultConfig = resolveParameters({ first: null, last: null }, config, false);
			assert.strictEqual(resultConfig.sourceLanguage, "fr");

			// Home config as fallback
			const configHomeOnly = {
				home: { deepL: { sourceLang: "ja" } },
				local: {},
			};
			const resultHome = resolveParameters({ first: null, last: null }, configHomeOnly, false);
			assert.strictEqual(resultHome.sourceLanguage, "ja");
		});

		it("should use cascading priority for target language", () => {
			const config = {
				home: { deepL: { targetLang: "ja" } },
				local: { deepL: { targetLang: "fr" } },
			};

			// CLI overrides config
			const resultCli = resolveParameters(
				{ first: { sourceLang: null, targetLang: "de" }, last: null },
				config,
				false,
			);
			assert.strictEqual(resultCli.targetLanguage, "de");

			// Local config overrides home config
			const resultConfig = resolveParameters({ first: null, last: null }, config, false);
			assert.strictEqual(resultConfig.targetLanguage, "fr");

			// Home config as fallback
			const configHomeOnly = {
				home: { deepL: { targetLang: "ja" } },
				local: {},
			};
			const resultHome = resolveParameters({ first: null, last: null }, configHomeOnly, false);
			assert.strictEqual(resultHome.targetLanguage, "ja");
		});

		it("should merge DeepL options with local overriding home", () => {
			const config = {
				home: {
					deepL: {
						options: {
							formality: "more",
							context: "home context",
						},
					},
				},
				local: {
					deepL: {
						options: {
							formality: "less", // overrides home
							modelType: "quality", // new option
						},
					},
				},
			};

			const result = resolveParameters({ first: null, last: null }, config, false);

			assert.deepStrictEqual(result.translationOptions, {
				formality: "less", // local overrides home
				context: "home context", // from home
				modelType: "quality", // from local
			});
		});

		it("should resolve clipboard copy from CLI flag", () => {
			const result = resolveParameters({ first: null, last: null }, emptyConfig, true);
			assert.strictEqual(result.shouldCopyToClipboard, true);
		});

		it("should resolve clipboard copy from local config", () => {
			const config = {
				home: {},
				local: { copyToClipboard: true },
			};

			const result = resolveParameters({ first: null, last: null }, config, false);
			assert.strictEqual(result.shouldCopyToClipboard, true);
		});

		it("should resolve clipboard copy from home config", () => {
			const config = {
				home: { copyToClipboard: true },
				local: {},
			};

			const result = resolveParameters({ first: null, last: null }, config, false);
			assert.strictEqual(result.shouldCopyToClipboard, true);
		});

		it("should prioritize CLI flag over config for clipboard copy", () => {
			const config = {
				home: { copyToClipboard: false },
				local: { copyToClipboard: false },
			};

			const result = resolveParameters({ first: null, last: null }, config, true);
			assert.strictEqual(result.shouldCopyToClipboard, true);
		});

		it("should prioritize local config over home config for clipboard copy", () => {
			const config = {
				home: { copyToClipboard: true },
				local: { copyToClipboard: true },
			};

			const result = resolveParameters({ first: null, last: null }, config, false);
			assert.strictEqual(result.shouldCopyToClipboard, true);

			// Test that local config with undefined/missing value falls back to home
			const configFallback = {
				home: { copyToClipboard: true },
				local: {},
			};

			const resultFallback = resolveParameters({ first: null, last: null }, configFallback, false);
			assert.strictEqual(resultFallback.shouldCopyToClipboard, true);
		});

		it("should throw error for __path in home config options", () => {
			const config = {
				home: {
					deepL: {
						options: {
							__path: "invalid",
							formality: "more",
						},
					},
				},
				local: {},
			};

			assert.throws(() => {
				resolveParameters({ first: null, last: null }, config, false);
			}, /Invalid \.sagmalrc in the .* directory: '__path' is an internal-only field/);
		});

		it("should throw error for __path in local config options", () => {
			const config = {
				home: {},
				local: {
					deepL: {
						options: {
							__path: "invalid",
							formality: "more",
						},
					},
				},
			};

			assert.throws(() => {
				resolveParameters({ first: null, last: null }, config, false);
			}, /Invalid \.sagmalrc .* directory: '__path' is an internal-only field/);
		});
	});
});
