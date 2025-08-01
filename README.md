# @fal-works/sagmal

Command-line translation tool powered by the DeepL API.


## Quick Start

Save your DeepL API key in a `.env` file located either in the current directory or your home directory.  
**Never commit your `.env` file to version control!**

```ini
SAGMAL_DEEPL_API_KEY=your-api-key-here
```

Then run the CLI tool with:

```sh
npx sagmal <text-to-translate>
```

Or, if you have installed it globally:

```sh
sagmal <text-to-translate>
```


## Specifying Languages

If the first word of your input contains a colon (`:`), it will be interpreted as a language option.

The format is `[from]:[to]`.

Examples:

```text
:en     # translate to English
de:     # from German
ja:vi   # from Japanese to Vietnamese
```

**Defaults:**

- If the source language is not specified via the CLI or configuration file, the DeepL API will automatically detect the source language.
- If the target language is not specified via the CLI or configuration file, it defaults to `en-US` (English, United States).


## Configuration

You can configure the tool by creating a `.sagmalrc.json` file in either your home directory or the current directory.

The configuration file must be in JSON format and can include:

- `deepL.sourceLang`: The default source language code.
- `deepL.targetLang`: The default target language code.
- `deepL.options`: [Text translation options](https://github.com/deeplcom/deepl-node?tab=readme-ov-file#text-translation-options) that will be passed to the DeepL API.

```json
{
  "deepL": {
    "sourceLang": "ja",
    "targetLang": "vi",
    "options": {
      "formality": "less",
      "context": "Always translate technical terms to English",
      "modelType": "latency_optimized",
      "tagHandling": "html"
    }
  }
}
```


## Help message

If no text is provided, or if the first argument is `--help` or `-h`, the tool will display a help message.

```text
Usage:
  sagmal [languages] <text>
Examples:
  sagmal Hallo, Welt!
  sagmal ja: 私は大丈夫です
  sagmal :it It's not a bug, it's a feature
  sagmal fr:ar Je pense, donc je suis
```
