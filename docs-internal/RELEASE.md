# Release Workflow

1. Validate and build: run `npm run fix`, `npm run build`, and `npm test`.
2. Add the new `.sagmalrc.json` schema to `docs/sagmalrc/` for the release version.
3. Update the version in `package.json`.
4. Check `npm publish --dry-run`
5. The repository owner merges the branch into `main` and tags the commit.
6. The repository owner executes the publishing command.
