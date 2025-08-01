#!/usr/bin/env node

import { DeepLError } from "deepl-node";
import { parseCliLanguageOption } from "./cli-language-parser.ts";
import { loadConfigInputs } from "./config-loader.ts";
import { getApiKey, loadEnvironment } from "./env-loader.ts";
import { SagmalError, stringifyError } from "./errors.ts";
import { showHelp } from "./help.ts";
import { resolveParameters } from "./parameter-resolver.ts";
import { translate } from "./translator.ts";

async function main(): Promise<void> {
	const args = process.argv.slice(2);

	// Show help if requested or no arguments provided
	if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
		showHelp();
		process.exit(0);
	}

	loadEnvironment();
	const apiKey = getApiKey();
	const configInputs = loadConfigInputs();
	const maybeCliLanguages = parseCliLanguageOption(args[0]);
	const textParts = maybeCliLanguages ? args.slice(1) : args;
	const cliLanguages = maybeCliLanguages ?? { sourceLang: null, targetLang: null };
	const text = textParts.join(" ");

	if (text.length === 0) {
		showHelp();
		process.exit(0);
	}

	// Validate text length to prevent sending large data accidentally
	if (text.length > 1024) {
		throw new SagmalError(`Text too long: ${text.length} characters (maximum: 1024).`);
	}

	const resolvedParams = resolveParameters(cliLanguages, configInputs);
	const translatedText = await translate(apiKey, text, resolvedParams);
	console.log(translatedText);
}

main().catch((error) => {
	if (error instanceof SagmalError) {
		console.error(error.name, ">", error.message);
	} else if (error instanceof DeepLError) {
		console.error("DeepL API Error", ">", error.name, ">", error.message);
	} else {
		console.error("Sagmal Unknown Error", ">", stringifyError(error));
	}
	process.exit(1);
});
