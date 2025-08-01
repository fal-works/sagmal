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

Then you will see the translated text in your terminal.


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

# Language options at both positions (confliction should be avoided)
ja: 私は大丈夫です :vi      # from Japanese to Vietnamese
```

### Language Defaults

- If you don't specify a source language in the CLI or config file, the DeepL API will detect it automatically.
- If you don't specify a target language in either place, it will default to `en-US`.


## Other Options

- `-c`, `--copy` : Copy translated text to clipboard (if available)
- `-h`, `--help` : Show help message


## Static Configuration

You can configure the tool by creating a `.sagmalrc.json` file in either your home directory or the current directory.

The configuration file must be in JSON format and can include:

- `copyToClipboard`: Automatically copy translated text to clipboard.
- `deepL.sourceLang`: The default source language code.
- `deepL.targetLang`: The default target language code.
- `deepL.options`: [Text translation options](https://github.com/deeplcom/deepl-node?tab=readme-ov-file#text-translation-options) that will be passed to the DeepL API.

```json
{
  "copyToClipboard": true,
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


## References

- DeepL API Documentation: <https://www.deepl.com/docs-api>
- DeepL API for Node.js: <https://github.com/DeepLcom/deepl-node>
