# @fal-works/sagmal

CLI translation tool using DeepL free API.

## Quick Start

Save your DeepL API key in a `.env` file either in the current directory or in your home directory. Each of these files is loaded, and the variable is resolved in priority order.

```ini
SAGMAL_DEEPL_API_KEY=your-api-key-here
```

Then run the CLI tool with:

```text
npx sagmal <text>
```

Or if you have installed it globally:

```text
sagmal <text>
```

## Specifying Languages

The first word in the command will be interpreted as the language option if it contains a colon `:`. The format is `[from]:[to]`, where `[from]` is the source language and `[to]` is the target language.

```text
:en # to English
de: # from German
ja:vi # from Japanese to Vietnamese
```

## Configuration

You can configure the tool by creating a `.sagmalrc.json` file in your home directory or in the current directory. Each of these files is loaded, and config options are resolved in priority order.
The configuration file should be in JSON format. The `options` object will be passed directly to the DeepL API.

```json
{
  "sourceLang": "ja",
  "targetLang": "vi",
  "options": {
    "formality": "less",
    "context": "Always translate technical terms to English",
    "modelType": "latency_optimized",
    "tagHandling": "html"
  }
}
```

## Help

If no text is provided, or the only argument is `--help` or `-h`, the tool will display a help message.

```text
Usage:
  sagmal [languages] <text>
Examples:
  sagmal Hallo, Welt!
  sagmal ja: 私は大丈夫です
  sagmal :it It's not a bug, it's a feature
  sagmal fr:ar Je pense, donc je suis
```
