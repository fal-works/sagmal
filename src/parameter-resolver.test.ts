import assert from "node:assert";
import { describe, it } from "node:test";
import { resolveParameters } from "./parameter-resolver.ts";

describe("parameter-resolver", () => {
	describe("resolveParameters", () => {
		const emptyConfig = {
			homeConfig: {},
			localConfig: {},
		};

		it("should use default values when no inputs provided", () => {
			const result = resolveParameters(null, null, emptyConfig, false);

			assert.strictEqual(result.sourceLanguage, null);
			assert.strictEqual(result.targetLanguage, "en-US");
			assert.strictEqual(result.shouldCopyToClipboard, false);
			assert.deepStrictEqual(result.translationOptions, {});
		});

		it("should resolve CLI language options", () => {
			const firstLang = { sourceLang: "ja", targetLang: null };
			const lastLang = { sourceLang: null, targetLang: "fr" };

			const result = resolveParameters(firstLang, lastLang, emptyConfig, false);

			assert.strictEqual(result.sourceLanguage, "ja");
			assert.strictEqual(result.targetLanguage, "fr");
		});

		it("should prioritize last language option over first when no conflict", () => {
			const firstLang = { sourceLang: "ja", targetLang: null };
			const lastLang = { sourceLang: null, targetLang: "de" };

			const result = resolveParameters(firstLang, lastLang, emptyConfig, false);

			assert.strictEqual(result.sourceLanguage, "ja");
			assert.strictEqual(result.targetLanguage, "de");
		});

		it("should throw error for conflicting source languages", () => {
			const firstLang = { sourceLang: "ja", targetLang: null };
			const lastLang = { sourceLang: "fr", targetLang: null };

			assert.throws(() => {
				resolveParameters(firstLang, lastLang, emptyConfig, false);
			}, /Conflicting source languages: 'ja' and 'fr'/);
		});

		it("should throw error for conflicting target languages", () => {
			const firstLang = { sourceLang: null, targetLang: "en" };
			const lastLang = { sourceLang: null, targetLang: "fr" };

			assert.throws(() => {
				resolveParameters(firstLang, lastLang, emptyConfig, false);
			}, /Conflicting target languages: 'en' and 'fr'/);
		});

		it("should normalize 'en' to 'en-US'", () => {
			const config = {
				homeConfig: { deepL: { targetLang: "en" } },
				localConfig: {},
			};

			const result = resolveParameters(null, null, config, false);

			assert.strictEqual(result.targetLanguage, "en-US");
		});

		it("should normalize 'EN' to 'en-US' (case insensitive)", () => {
			const config = {
				homeConfig: { deepL: { targetLang: "EN" } },
				localConfig: {},
			};

			const result = resolveParameters(null, null, config, false);

			assert.strictEqual(result.targetLanguage, "en-US");
		});

		it("should use cascading priority for source language", () => {
			const config = {
				homeConfig: { deepL: { sourceLang: "ja" } },
				localConfig: { deepL: { sourceLang: "fr" } },
			};

			// CLI overrides config
			const resultCli = resolveParameters(
				{ sourceLang: "de", targetLang: null },
				null,
				config,
				false,
			);
			assert.strictEqual(resultCli.sourceLanguage, "de");

			// Local config overrides home config
			const resultConfig = resolveParameters(null, null, config, false);
			assert.strictEqual(resultConfig.sourceLanguage, "fr");

			// Home config as fallback
			const configHomeOnly = {
				homeConfig: { deepL: { sourceLang: "ja" } },
				localConfig: {},
			};
			const resultHome = resolveParameters(null, null, configHomeOnly, false);
			assert.strictEqual(resultHome.sourceLanguage, "ja");
		});

		it("should use cascading priority for target language", () => {
			const config = {
				homeConfig: { deepL: { targetLang: "ja" } },
				localConfig: { deepL: { targetLang: "fr" } },
			};

			// CLI overrides config
			const resultCli = resolveParameters(
				{ sourceLang: null, targetLang: "de" },
				null,
				config,
				false,
			);
			assert.strictEqual(resultCli.targetLanguage, "de");

			// Local config overrides home config
			const resultConfig = resolveParameters(null, null, config, false);
			assert.strictEqual(resultConfig.targetLanguage, "fr");

			// Home config as fallback
			const configHomeOnly = {
				homeConfig: { deepL: { targetLang: "ja" } },
				localConfig: {},
			};
			const resultHome = resolveParameters(null, null, configHomeOnly, false);
			assert.strictEqual(resultHome.targetLanguage, "ja");
		});

		it("should merge DeepL options with local overriding home", () => {
			const config = {
				homeConfig: {
					deepL: {
						options: {
							formality: "more",
							context: "home context",
						},
					},
				},
				localConfig: {
					deepL: {
						options: {
							formality: "less", // overrides home
							modelType: "quality", // new option
						},
					},
				},
			};

			const result = resolveParameters(null, null, config, false);

			assert.deepStrictEqual(result.translationOptions, {
				formality: "less", // local overrides home
				context: "home context", // from home
				modelType: "quality", // from local
			});
		});

		it("should resolve clipboard copy from CLI flag", () => {
			const result = resolveParameters(null, null, emptyConfig, true);
			assert.strictEqual(result.shouldCopyToClipboard, true);
		});

		it("should resolve clipboard copy from local config", () => {
			const config = {
				homeConfig: {},
				localConfig: { copyToClipboard: true },
			};

			const result = resolveParameters(null, null, config, false);
			assert.strictEqual(result.shouldCopyToClipboard, true);
		});

		it("should resolve clipboard copy from home config", () => {
			const config = {
				homeConfig: { copyToClipboard: true },
				localConfig: {},
			};

			const result = resolveParameters(null, null, config, false);
			assert.strictEqual(result.shouldCopyToClipboard, true);
		});

		it("should prioritize CLI flag over config for clipboard copy", () => {
			const config = {
				homeConfig: { copyToClipboard: false },
				localConfig: { copyToClipboard: false },
			};

			const result = resolveParameters(null, null, config, true);
			assert.strictEqual(result.shouldCopyToClipboard, true);
		});

		it("should prioritize local config over home config for clipboard copy", () => {
			const config = {
				homeConfig: { copyToClipboard: true },
				localConfig: { copyToClipboard: true },
			};

			const result = resolveParameters(null, null, config, false);
			assert.strictEqual(result.shouldCopyToClipboard, true);

			// Test that local config with undefined/missing value falls back to home
			const configFallback = {
				homeConfig: { copyToClipboard: true },
				localConfig: {},
			};

			const resultFallback = resolveParameters(null, null, configFallback, false);
			assert.strictEqual(resultFallback.shouldCopyToClipboard, true);
		});

		it("should throw error for __path in home config options", () => {
			const config = {
				homeConfig: {
					deepL: {
						options: {
							__path: "invalid",
							formality: "more",
						},
					},
				},
				localConfig: {},
			};

			assert.throws(() => {
				resolveParameters(null, null, config, false);
			}, /Invalid config: '__path' is an internal-only field/);
		});

		it("should throw error for __path in local config options", () => {
			const config = {
				homeConfig: {},
				localConfig: {
					deepL: {
						options: {
							__path: "invalid",
							formality: "more",
						},
					},
				},
			};

			assert.throws(() => {
				resolveParameters(null, null, config, false);
			}, /Invalid config: '__path' is an internal-only field/);
		});
	});
});