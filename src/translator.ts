import {
	DeepLClient,
	type DeepLClientOptions,
	type TargetLanguageCode,
	type TextResult,
} from "deepl-node";
import * as packageJson from "../package.json" with { type: "json" };
import { areLikelySameLanguageCodes } from "./language-code.ts";
import type { ResolvedTranslationParameters } from "./parameter-resolver.ts";

/**
 * DeepL API client options.
 */
const clientOptions: DeepLClientOptions = {
	appInfo: { appName: packageJson.name, appVersion: packageJson.version },
};

/**
 * Determines if the translation likely didn't a meaningful translation.
 * Uses simplified language matching logic and text comparison.
 */
function isLikelySameLanguageTranslation(
	inputText: string,
	translationResult: TextResult,
	targetLanguage: string,
): boolean {
	const languageCodesEquivalent = areLikelySameLanguageCodes(
		translationResult.detectedSourceLang,
		targetLanguage,
	);

	const textUnchanged = inputText.trim() === translationResult.text.trim();

	return languageCodesEquivalent && textUnchanged;
}

/**
 * Determines the fallback target language to use, if any.
 *
 * @param inputText - Original input text
 * @param params - Resolved translation parameters
 * @param translationResult - Result from initial translation attempt
 * @returns Fallback target language if conditions are met, null otherwise
 */
function getFallbackTargetLanguage(
	inputText: string,
	params: ResolvedTranslationParameters,
	translationResult: TextResult,
): TargetLanguageCode | null {
	if (
		!params.isTargetLanguageFromCli && // Target language was not explicitly specified via CLI
		params.targetLanguageSecond != null && // Second-default is configured
		isLikelySameLanguageTranslation(inputText, translationResult, params.targetLanguage) // Same language detected
	) {
		return params.targetLanguageSecond;
	}
	return null;
}

/**
 * Translates text using the DeepL API with fully resolved parameters.
 * Implements smart fallback to second-default target language when:
 * - Target language was not explicitly specified via CLI
 * - Second-default target language is configured
 * - Detected source language is the same as (or similar to) resolved target language
 *
 * @param apiKey - DeepL API key
 * @param text - Text to translate
 * @param params - Fully resolved translation parameters
 * @returns Translated text
 */
export async function translate(
	apiKey: string,
	text: string,
	params: ResolvedTranslationParameters,
): Promise<string> {
	const client = new DeepLClient(apiKey, clientOptions);

	const result = await client.translateText(
		text,
		params.sourceLanguage,
		params.targetLanguage,
		params.translationOptions,
	);

	const fallbackTargetLanguage = getFallbackTargetLanguage(text, params, result);
	if (fallbackTargetLanguage != null) {
		// Second attempt
		const fallbackResult = await client.translateText(
			text,
			params.sourceLanguage,
			fallbackTargetLanguage,
			params.translationOptions,
		);
		return fallbackResult.text;
	}

	return result.text;
}
