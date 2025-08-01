import * as deepl from "deepl-node";
import * as packageJson from "../package.json" with { type: "json" };
import type { ResolvedTranslationParameters } from "./parameter-resolver.ts";

/**
 * DeepL API client options.
 */
const clientOptions: deepl.DeepLClientOptions = {
	appInfo: { appName: packageJson.name, appVersion: packageJson.version },
};

/**
 * Translates text using the DeepL API with fully resolved parameters.
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
	const client = new deepl.DeepLClient(apiKey, clientOptions);

	const result = await client.translateText(
		text,
		params.sourceLanguage,
		params.targetLanguage,
		params.translationOptions,
	);

	return result.text;
}
