# Development Rules and Guidelines

## Commands

Use `npm run`, not `pnpm run`.

- `npm run check` - Check code quality (types, linting, and format)
- `npm run fix` - Check code quality and fix if possible
- `npm run test:unit` - Run unit tests
- `npm run build` - Build

## Development Workflow

- After any changes, run the below
	- `npm run fix`
	- `npm run test:unit`

## Code Requirements

- Implementations:
	- Add `.ts` extensions to imports: `import { ... } from "./mod.ts"`
	- No `any` types or unsafe assertions
- Structures:
	- Prefer functions over classes, stateless over stateful
	- Minimize exports per module
	- Minimize runtime type checks like `string | string[]`
- Comments:
	- Minimize implementation comments. Let the code speak for itself
	- Avoid explaining "recent changes"
- Temporary files:
	- When creating temporary files that are to be removed later, always use `TMP_` prefix.

## Patterns to Follow

- **Sum Types for Finite State Spaces:**
	- When you have a finite set of valid states, use sum types `type Choice = "a" | "b"`
	- "Make illegal states unrepresentable" - use types to eliminate invalid states/combinations at compile time
- **Focus on Cohesion of Each Function:**
	- First design functions with clear, single responsibilities (functional cohesion)
	- Then compose them into workflows (sequential cohesion)
- **Reduce Complexity of Package Dependency Graph:**
	- Aim for one-way dependencies. Avoid circular references among packages if possible
	- Suggest reorganizing packages when dependencies become complex

## Refactoring Guidelines

- **Structure-level refactoring** (e.g. module extraction, separation):
	- Preserve implementation of individual code blocks when moving in/between modules
	- Maintain existing documentation comments unless the logic/meaning changes
	- Focus changes on module boundaries and import/export statements
- **General changes**:
	- Do not maintain backward compatibility unless requested
	- Keep module dependencies simple and explicit
	- When restructuring modules, separate test modules accordingly to maintain 1:1 correspondence
