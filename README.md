# @fal-works/sagmal

Command-line translation tool powered by the DeepL API.

> "sagmal" comes from the German "Sag mal" ("say" or "tell me").

Note: This is an early-stage project, primarily developed for personal use.

## Quick Start

Save your DeepL API key in a `.env` file located either in the current directory or your home directory.  
**Never commit your `.env` file to version control!**

```ini
SAGMAL_DEEPL_API_KEY=your-api-key-here
```

Then run the CLI tool with:

```text
npx sagmal <text-to-translate>
```

Or, if you have installed it globally:

```text
sagmal <text-to-translate>
```

The translated text will then appear in your terminal.


## Language Options

You can specify language options at the **first** or **last** position of your input text using colon (`:`) syntax.

The format is `[from]:[to]`.

### Language Option Examples

```text
# Language option at the first position
de: Hallo Welt             # from German
:en Oh mon Dieu            # to English
ja:vi 私は大丈夫です        # from Japanese to Vietnamese

# Language option at the last position
Hallo Welt de:             # from German
Oh mon Dieu :en            # to English
私は大丈夫です ja:vi        # from Japanese to Vietnamese

# Language options at both positions (avoid conflicts)
ja: 私は大丈夫です :vi      # from Japanese to Vietnamese
```

### Language Defaults

- If you do not specify a source language in the CLI or config file, the DeepL API will detect it automatically.
- If you do not specify a target language in the CLI or config file, it will default to `en-US`.


## Other Options

- `-c`, `--copy` : Copy translated text to clipboard (if available)
- `-h`, `--help` : Show help message


## Static Configuration

### Configuration File

You can configure the tool by creating a `.sagmalrc.json` file in either your home directory or the current directory.

The configuration file must be in JSON format and can include:

- `copyToClipboard`: Automatically copy translated text to clipboard.
- `deepL.sourceLang`: The default [source language code](https://developers.deepl.com/docs/getting-started/supported-languages).
- `deepL.targetLang`: The default [target language code](https://developers.deepl.com/docs/getting-started/supported-languages#translation-source-languages).
- `deepL.targetLang2`: The secondary default target language code. See [Secondary Default Target Language](#secondary-default-target-language) for details.
- `deepL.options`: [Text translation options](https://github.com/deeplcom/deepl-node?tab=readme-ov-file#text-translation-options) that will be passed to the DeepL API.

```json
{
  "copyToClipboard": true,
  "deepL": {
    "sourceLang": "ja",
    "targetLang": "en-US",
    "targetLang2": "ja",
    "options": {
      "formality": "less",
      "context": "Always translate technical terms to English",
      "modelType": "latency_optimized",
      "tagHandling": "html"
    }
  }
}
```

### Secondary Default Target Language

The `targetLang2` option provides automatic fallback when sagmal assumes
no meaningful translation occurred due to matching source and target languages.
This commonly happens when you input English text and the default target language is also English.

**Example:**
```bash
# Config: { "deepL": { "targetLang2": "de" } }
sagmal Hello world
# → Detects English → Targets "de" instead of English → "Hallo Welt"
```

**Conditions:**
- Target language not explicitly specified via CLI (`:en`, `de:`, etc.)
- `targetLang2` configured in `.sagmalrc.json`
- Detected source language matches resolved target language
- Input and output text are unchanged

**Note:** Simplified language matching is used (e.g., `en` matches `en-US`, but `en-US` does not match `en-GB`), which may not be accurate in all cases.


## References

- DeepL API Documentation: <https://www.deepl.com/docs-api>
- DeepL API for Node.js: <https://github.com/DeepLcom/deepl-node>
