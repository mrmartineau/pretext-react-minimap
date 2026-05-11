---
name: creating-npm-packages
description: 'Scaffold new TypeScript npm packages with ESM + CJS dual output, Biome linting, Bun testing, tsdown bundling, semantic-release publishing, and GitHub Actions CI. Use when asked to create, scaffold, or set up a new npm package.'
---

# Creating npm Packages

Scaffold production-ready TypeScript npm packages with a consistent stack:
**Bun** (runtime/test), **tsdown** (bundler), **Biome** (lint/format), **semantic-release** (publishing), **GitHub Actions** (CI).

## Workflow

1. Create the project directory and initialise git
2. Generate all config files using the templates below
3. Replace placeholder values (`PACKAGE_NAME`, `PACKAGE_DESCRIPTION`, `GITHUB_OWNER`, `GITHUB_REPO`) with user-provided values
4. Write initial source code in `src/index.ts` and a starter test in `src/index.test.ts`
5. Run `bun install`
6. Run `bun run build` to verify the setup works
7. Run `bun test` to verify tests pass

## Project Structure

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   ├── index.ts
│   └── index.test.ts
├── .gitignore
├── biome.json
├── LICENSE
├── package.json
├── README.md
├── release.config.mjs
└── tsconfig.json
```

## File Templates

### package.json

```json
{
  "name": "PACKAGE_NAME",
  "version": "0.0.0",
  "description": "PACKAGE_DESCRIPTION",
  "license": "ISC",
  "type": "module",
  "files": [
    "dist"
  ],
  "author": {
    "name": "Zander Martineau",
    "email": "zander@zander.wtf",
    "url": "https://zander.wtf"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/GITHUB_OWNER/GITHUB_REPO.git"
  },
  "homepage": "https://github.com/GITHUB_OWNER/GITHUB_REPO",
  "bugs": {
    "url": "https://github.com/GITHUB_OWNER/GITHUB_REPO/issues"
  },
  "main": "./dist/index.cjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "publishConfig": {
    "access": "public"
  },
  "engines": {
    "node": ">=20.19.0"
  },
  "scripts": {
    "build": "tsdown src/index.ts --format cjs,esm --target es2020 --dts --sourcemap --clean",
    "check": "biome check --write .",
    "dev": "tsdown src/index.ts --format cjs,esm --target es2020 --dts --sourcemap --watch",
    "release": "semantic-release",
    "test": "bun test"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.4.6",
    "@semantic-release/git": "^10.0.1",
    "@semantic-release/github": "^11.0.0",
    "@types/bun": "^1.3.10",
    "@types/node": "^25.4.0",
    "semantic-release": "^25.0.3",
    "tsdown": "^0.21.2",
    "typescript": "^5.9.3"
  }
}
```

Key conventions:
- Always set `"type": "module"` for ESM-first
- Dual `exports` map with `types`, `import`, and `require` conditions
- `"files": ["dist"]` to publish only built output
- `"publishConfig": { "access": "public" }` for scoped packages
- Use `tsdown` (not tsup) for bundling

### release.config.mjs

```js
export default {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/npm',
    [
      '@semantic-release/git',
      {
        assets: ['package.json'],
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    [
      '@semantic-release/github',
      {
        failComment: false,
        failTitle: false,
      },
    ],
  ],
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "skipLibCheck": true,
    "target": "es2022",
    "allowJs": true,
    "resolveJsonModule": true,
    "moduleDetection": "force",
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "module": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "sourceMap": true,
    "declaration": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts"]
}
```

### biome.json

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.6/schema.json",
  "files": {
    "ignoreUnknown": false,
    "includes": ["**", "!dist"]
  }
}
```

### .github/workflows/ci.yml

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2

      - name: Install dependencies
        run: bun install

      - name: Check
        run: bun run check

      - name: Build
        run: bun run build

      - name: Run Tests
        run: bun test

  release:
    needs: ci
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2

      - name: Install dependencies
        run: bun install

      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: bun run release
```

### .gitignore

```
node_modules/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Environment variables
.env
.env.*
!.env.example

# Build output and caches
dist/
build/
coverage/
.cache/
.turbo/
.vite/
*.tsbuildinfo

# OS files
.DS_Store
Thumbs.db

# Editor/IDE files
.idea/
.vscode/
*.swp
*.swo
```

### LICENSE (ISC)

```
ISC License

Copyright (c) CURRENT_YEAR Zander Martineau

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
```

### src/index.ts (starter)

Write the actual package implementation here. If no specific functionality is requested, use this minimal starter:

```ts
export interface HelloOptions {
	punctuation?: string;
}

export function hello(
	name = "world",
	{ punctuation = "!" }: HelloOptions = {},
): string {
	return `Hello, ${name}${punctuation}`;
}
```

### src/index.test.ts (starter)

```ts
import { describe, expect, test } from 'bun:test'

import { hello } from './index.js'

describe('hello', () => {
  test('returns a greeting with the provided name', () => {
    expect(hello('Bun')).toBe('Hello, Bun!')
  })
})
```

## Conventions

- **Runtime**: Bun for installing, running, and testing
- **Bundler**: tsdown (ESM + CJS dual output with `.js` and `.cjs` extensions)
- **Linting/formatting**: Biome (not ESLint/Prettier)
- **Testing**: `bun:test` (not Jest or Vitest)
- **Releasing**: semantic-release with conventional commits — releases are fully automated via CI
- **Target**: ES2020 for broad compatibility, Node.js ≥ 20.19.0
- **Strict TypeScript**: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `verbatimModuleSyntax`
- **Imports**: Always use `.js` extension in relative imports (required by `verbatimModuleSyntax` + NodeNext)

## Release Conventions

Releases are automated via `semantic-release` on every push to `main`. Version bumps are determined by conventional commit messages:

- `fix:` → patch release
- `feat:` → minor release
- `feat!:` or `BREAKING CHANGE:` in footer → major release

The CI `release` job requires two repository secrets:
- `NPM_TOKEN` — npm publish token
- `GITHUB_TOKEN` — automatically provided by GitHub Actions

## Multiple Entrypoints

If the package needs multiple entrypoints, update both the build command and the `exports` map:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.js",
      "require": "./dist/utils.cjs"
    }
  },
  "scripts": {
    "build": "tsdown src/index.ts src/utils.ts --format cjs,esm --target es2020 --dts --sourcemap --clean"
  }
}
```

## Adding Runtime Dependencies

When the package needs runtime dependencies, add them to `dependencies` (not `devDependencies`). Only devDependencies should include build tools, types, and test utilities.

## README Template

Generate a README with:
1. Package name as heading
2. One-line description
3. Install instructions (`bun add PACKAGE_NAME` / `npm install PACKAGE_NAME`)
4. Usage example with import
5. API documentation for exported functions/types
6. License footer
