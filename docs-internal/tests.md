# Tests

## Overview

We use Node.js built-in testing framework for both unit and integration tests.
Focus on testing pure functions and business logic while avoiding external dependencies.

## Unit Test Modules

### Structure
- Each implementation module has a corresponding adjacent test module: `src/mod.ts` → `src/mod.test.ts`
- Mirror module structure within test `describe()` blocks
- Use consistent naming: `describe("module-name")` → `describe("functionName")`

### Modules to Skip
- `src/cli-parser.ts` - Uses `parseArgs()` from `node:util`
- `src/env-loader.ts` - Environment variable loading
- `src/config-loader.ts` - File I/O operations  
- `src/translator.ts` - External API wrapper
- `src/clipboard.ts` - Platform-dependent operations
- `src/bin.ts` - Integration logic (covered by integration tests)


## Integration Tests

### Structure
- Place integration tests in `test/` directory
- Test full CLI workflow end-to-end

### Environment Assumptions
- DeepL API key is available in `.env` file
- Tests run with proper environment setup

### Integration Test Guidelines
- **Skip all tests related to API key and environment variables**
- Be cautious about adding test cases that involve API calls


## Commands

- `npm run build` - Build before running integration tests
- `npm run test` - Run all tests (unit + integration)
- `npm run test:unit` - Run only unit tests  
- `npm run test:integration` - Run only integration tests
