import type * as deepl from "deepl-node";
import type { CliLanguageOptionData, CliLanguageOptions } from "./cli-language-parser.ts";
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
	/** Whether to copy translated text to clipboard */
	shouldCopyToClipboard: boolean;
}

/**
 * Parameter layer for cascading resolution.
 * All fields are optional to allow partial specification at each layer.
 */
interface ParameterLayer {
	/** Source language (null = auto-detect) */
	sourceLanguage?: deepl.SourceLanguageCode | null;
	/** Target language */
	targetLanguage?: deepl.TargetLanguageCode;
	/** DeepL API options */
	translationOptions: Record<string, unknown>;
	/** Whether to copy translated text to clipboard */
	shouldCopyToClipboard?: boolean;
}

/**
 * Coalesces a property from two parameter layers, with higher priority taking precedence.
 */
function coalesceProperty<T, K extends keyof T>(target: T, lower: T, higher: T, key: K): void {
	if (higher[key] !== undefined) target[key] = higher[key];
	else if (lower[key] !== undefined) target[key] = lower[key];
}

/**
 * Merges two parameter layers with the second layer taking priority.
 *
 * @param lower - Lower priority layer
 * @param higher - Higher priority layer (overrides lower)
 * @returns Merged parameter layer
 */
function mergeParameterLayers(lower: ParameterLayer, higher: ParameterLayer): ParameterLayer {
	const result: ParameterLayer = {
		translationOptions: {
			...lower.translationOptions,
			...higher.translationOptions,
		},
	};

	coalesceProperty(result, lower, higher, "sourceLanguage");
	coalesceProperty(result, lower, higher, "targetLanguage");
	coalesceProperty(result, lower, higher, "shouldCopyToClipboard");

	return result;
}

/**
 * Creates the default parameter layer.
 */
function createDefaultLayer(): ParameterLayer {
	return {
		sourceLanguage: null, // auto-detect
		targetLanguage: "en-US",
		translationOptions: {},
		shouldCopyToClipboard: false,
	};
}

/**
 * Creates parameter layer from config object.
 */
function createConfigLayer(
	config: ConfigInputs["homeConfig"] | ConfigInputs["localConfig"],
): ParameterLayer {
	const result: ParameterLayer = {
		translationOptions: config.deepL?.options ?? {},
	};

	if (config.deepL?.sourceLang)
		result.sourceLanguage = config.deepL.sourceLang as deepl.SourceLanguageCode;
	if (config.deepL?.targetLang)
		result.targetLanguage = config.deepL.targetLang as deepl.TargetLanguageCode;
	if (config.copyToClipboard !== undefined) result.shouldCopyToClipboard = config.copyToClipboard;

	return result;
}

/**
 * Creates parameter layer from CLI arguments.
 */
function createCliLayer(
	mergedCliLanguages: CliLanguageOptionData,
	cliCopyFlag: boolean,
): ParameterLayer {
	const result: ParameterLayer = {
		translationOptions: {}, // CLI does not specify any text translation options
	};

	if (mergedCliLanguages.sourceLang)
		result.sourceLanguage = mergedCliLanguages.sourceLang as deepl.SourceLanguageCode;
	if (mergedCliLanguages.targetLang)
		result.targetLanguage = mergedCliLanguages.targetLang as deepl.TargetLanguageCode;
	if (cliCopyFlag) result.shouldCopyToClipboard = true;

	return result;
}

/**
 * Merges multiple CLI language options with conflict detection.
 */
function mergeCliLanguageOptions(cliLanguages: CliLanguageOptions): CliLanguageOptionData {
	const { first: firstLang, last: lastLang } = cliLanguages;
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
 * Applies post-processing to the merged parameter layer.
 * Handles normalization, validation, and type conversion.
 */
function applyPostProcessing(
	resolved: ParameterLayer,
	configInputs: ConfigInputs,
): ResolvedTranslationParameters {
	// Validate translation options for internal-only fields
	const homeOptions = configInputs.homeConfig.deepL?.options;
	const localOptions = configInputs.localConfig.deepL?.options;

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

	// Normalize target language ('en' -> 'en-US')
	// At this point targetLanguage is guaranteed to exist due to default layer
	const targetLanguage = resolved.targetLanguage ?? "en-US";
	const normalizedTarget = targetLanguage.toLowerCase() === "en" ? "en-US" : targetLanguage;

	// Convert to final resolved parameters with guaranteed values
	// These values are guaranteed to exist due to default layer providing fallbacks
	return {
		sourceLanguage: resolved.sourceLanguage ?? null, // null is valid (auto-detect)
		targetLanguage: normalizedTarget,
		translationOptions: resolved.translationOptions ?? {},
		shouldCopyToClipboard: resolved.shouldCopyToClipboard ?? false,
	};
}

/**
 * Centralized parameter resolution with complete cascading logic.
 *
 * Resolution priority (later overrides earlier):
 * 1. Default values (source: null/auto-detect, target: 'en-US', copyToClipboard: false)
 * 2. Home directory config
 * 3. Local directory config
 * 4. CLI language arguments and flags
 *
 * Special handling:
 * - 'en' (case-insensitive) is normalized to 'en-US'
 * - DeepL options are merged (local overrides home)
 * - Clipboard copy follows CLI flag → local config → home config → false
 *
 * @param cliLanguages - CLI language options from both positions
 * @param configInputs - Configuration inputs from files (always provided, uses empty objects as defaults)
 * @param cliCopyFlag - CLI copy flag from parsed arguments
 * @returns Fully resolved parameters ready for translation
 */
export function resolveParameters(
	cliLanguages: CliLanguageOptions,
	configInputs: ConfigInputs,
	cliCopyFlag: boolean,
): ResolvedTranslationParameters {
	// Step 1: Merge CLI language options with conflict detection
	const mergedCliLanguages = mergeCliLanguageOptions(cliLanguages);

	// Step 2: Create parameter layers for each priority level
	const defaultLayer = createDefaultLayer();
	const homeLayer = createConfigLayer(configInputs.homeConfig);
	const localLayer = createConfigLayer(configInputs.localConfig);
	const cliLayer = createCliLayer(mergedCliLanguages, cliCopyFlag);

	// Step 3: Apply cascading priority through sequential merging
	let resolved = defaultLayer;
	resolved = mergeParameterLayers(resolved, homeLayer);
	resolved = mergeParameterLayers(resolved, localLayer);
	resolved = mergeParameterLayers(resolved, cliLayer);

	// Step 4: Apply post-processing and validation
	const finalResult = applyPostProcessing(resolved, configInputs);

	return finalResult;
}
