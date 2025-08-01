import type * as deepl from "deepl-node";
import type { CliLanguageOptionData } from "./cli-language-parser.ts";
import type { ConfigInputs } from "./config-loader.ts";
import { SagmalError } from "./errors.ts";

/**
 * Fully resolved translation parameters ready for DeepL API.
 */
export interface ResolvedTranslationParameters {
	/** Source language (null = auto-detect) */
	sourceLanguage: deepl.SourceLanguageCode | null;
	/** Target language (guaranteed to exist, normalized) */
	targetLanguage: deepl.TargetLanguageCode;
	/** DeepL API options merged from configs */
	translationOptions: Record<string, unknown>;
}

/**
 * Merges multiple CLI language options with conflict detection.
 */
function mergeCliLanguageOptions(
	firstLang: CliLanguageOptionData | null,
	lastLang: CliLanguageOptionData | null,
): CliLanguageOptionData {
	const firstSource = firstLang?.sourceLang ?? null;
	const firstTarget = firstLang?.targetLang ?? null;
	const lastSource = lastLang?.sourceLang ?? null;
	const lastTarget = lastLang?.targetLang ?? null;

	if (firstSource && lastSource && firstSource !== lastSource) {
		throw new SagmalError(`Conflicting source languages: '${firstSource}' and '${lastSource}'`);
	}

	if (firstTarget && lastTarget && firstTarget !== lastTarget) {
		throw new SagmalError(`Conflicting target languages: '${firstTarget}' and '${lastTarget}'`);
	}

	return {
		sourceLang: lastSource ?? firstSource,
		targetLang: lastTarget ?? firstTarget,
	};
}

/**
 * Resolves source language with cascading priority.
 * Priority order: CLI → local config → home config → null (auto-detect)
 */
function resolveSourceLanguage(
	cliLanguages: CliLanguageOptionData,
	configInputs: ConfigInputs,
): deepl.SourceLanguageCode | null {
	let src = null;
	src ??= cliLanguages.sourceLang;
	src ??= configInputs.localConfig.deepL?.sourceLang;
	src ??= configInputs.homeConfig.deepL?.sourceLang;
	src ??= null; // Prevent undefined

	return src as deepl.SourceLanguageCode | null;
}

/**
 * Resolves target language with cascading priority.
 * Priority order: CLI → local config → home config → 'en-US' (default)
 * Also normalizes 'en' to 'en-US'.
 */
function resolveTargetLanguage(
	cliLanguages: CliLanguageOptionData,
	configInputs: ConfigInputs,
): deepl.TargetLanguageCode {
	let target = null;
	target ??= cliLanguages.targetLang;
	target ??= configInputs.localConfig.deepL?.targetLang;
	target ??= configInputs.homeConfig.deepL?.targetLang;
	target ??= "en-US";
	if (target.toLowerCase() === "en") target = "en-US";

	return target as deepl.TargetLanguageCode;
}

/**
 * Merges DeepL API options from config files.
 * Local config options override home config options.
 * Validates that no internal-only fields are present.
 */
function mergeTranslationOptions(configInputs: ConfigInputs): Record<string, unknown> {
	const homeOptions = configInputs.homeConfig.deepL?.options;
	const localOptions = configInputs.localConfig.deepL?.options;

	// Validate no internal-only fields
	if (homeOptions && "__path" in homeOptions) {
		throw new SagmalError(
			"Invalid config: '__path' is an internal-only field and cannot be used in configuration",
		);
	}
	if (localOptions && "__path" in localOptions) {
		throw new SagmalError(
			"Invalid config: '__path' is an internal-only field and cannot be used in configuration",
		);
	}

	return {
		...homeOptions,
		...localOptions,
	};
}

/**
 * Centralized parameter resolution with complete cascading logic.
 *
 * Resolution priority (later overrides earlier):
 * 1. Default values (source: null/auto-detect, target: 'en-US')
 * 2. Home directory config
 * 3. Local directory config
 * 4. CLI language arguments
 *
 * Special handling:
 * - 'en' (case-insensitive) is normalized to 'en-US'
 * - DeepL options are merged (local overrides home)
 *
 * @param cliLanguages - Parsed CLI language arguments (always provided, uses default object if no language specified)
 * @param configInputs - Configuration inputs from files (always provided, uses empty objects as defaults)
 * @returns Fully resolved parameters ready for translation
 */
export function resolveParameters(
	firstCliLanguages: CliLanguageOptionData | null,
	lastCliLanguages: CliLanguageOptionData | null,
	configInputs: ConfigInputs,
): ResolvedTranslationParameters {
	const mergedCliLanguages = mergeCliLanguageOptions(firstCliLanguages, lastCliLanguages);

	const sourceLanguage = resolveSourceLanguage(mergedCliLanguages, configInputs);
	const targetLanguage = resolveTargetLanguage(mergedCliLanguages, configInputs);
	const translationOptions = mergeTranslationOptions(configInputs);

	return {
		sourceLanguage,
		targetLanguage,
		translationOptions,
	};
}
