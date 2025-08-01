#!/usr/bin/env node

import { DeepLError } from "deepl-node";
import { parseCliArguments } from "./cli-parser.ts";
import { copyToClipboard } from "./clipboard.ts";
import { loadConfigInputs } from "./config-loader.ts";
import { getApiKey, loadEnvironment } from "./env-loader.ts";
import { SagmalError, stringifyError } from "./errors.ts";
import { showHelp } from "./help.ts";
import { resolveParameters } from "./parameter-resolver.ts";
import { translate } from "./translator.ts";

async function main(): Promise<void> {
	const parseResult = parseCliArguments();

	if (parseResult.shouldShowHelp) {
		showHelp();
		process.exit(0);
	}

	loadEnvironment();
	const apiKey = getApiKey();
	const configInputs = loadConfigInputs();

	const text = parseResult.text;
	if (text.length === 0) {
		showHelp();
		process.exit(0);
	}

	const resolvedParams = resolveParameters(
		parseResult.languageOptions,
		configInputs,
		parseResult.shouldCopyToClipboard,
	);
	const translatedText = await translate(apiKey, text, resolvedParams);

	console.log(translatedText);

	if (resolvedParams.shouldCopyToClipboard) {
		await copyToClipboard(translatedText);
	}
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
