# npm-package-base

A starter template for building TypeScript npm packages with ESM + CJS dual output, Biome, Bun, and automated releases via semantic-release.

This repository is meant to be copied and customised for each new package you publish.

## What's included

- TypeScript source in `src/`
- Bundling with `tsdown` (ESM + CJS output)
- Generated `.d.ts` types
- Linting and formatting with Biome
- Testing with Bun
- Automated releases via `semantic-release`
- GitHub Actions CI with build, test, and release jobs

## How to use this template

1. Create a new repository from this one, or clone/copy it into a new folder.
2. Update `package.json`:
   - change `name`
   - change `description`
   - update `repository`, `homepage`, and `bugs` fields
3. Replace the starter implementation in `src/index.ts` with your package code.
4. Add any runtime dependencies your package needs.
5. Install dependencies and start developing.
6. Add `NPM_TOKEN` as a repository secret in GitHub for automated publishing.

## Install dependencies

```bash
bun install
```

## Development

```bash
# Build ESM, CJS, and type declarations
bun run build

# Rebuild on file changes
bun run dev

# Check & fix formatting + linting
bun run check

# Run tests
bun test
```

## Releasing

Releases are fully automated via `semantic-release` on every push to `main`. Version bumps follow [conventional commits](https://www.conventionalcommits.org/):

- `fix:` → patch
- `feat:` → minor
- `feat!:` or `BREAKING CHANGE:` → major

The CI release job requires a `NPM_TOKEN` repository secret. `GITHUB_TOKEN` is provided automatically by GitHub Actions.

## Project structure

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   ├── index.ts
│   └── index.test.ts
├── biome.json
├── package.json
├── release.config.mjs
└── tsconfig.json
```

## Agent Skill

This repo includes an agent skill (`SKILL.md`) that teaches AI coding agents how to scaffold new npm packages using this template's conventions. Install it with [`npx skills`](https://github.com/vercel-labs/skills):

```bash
# Interactive — choose your agent(s) and scope
npx skills add mrmartineau/npm-package-base

# Install globally for Claude Code
npx skills add mrmartineau/npm-package-base -g -a claude-code
```

Once installed, your agent will automatically use this skill when asked to create or scaffold a new npm package.

## License

[ISC](https://choosealicense.com/licenses/isc/) © [Zander Martineau](https://zander.wtf)

> Made by Zander • [zander.wtf](https://zander.wtf) • [GitHub](https://github.com/mrmartineau/)
