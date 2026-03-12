# Repo Restructure — Design Spec

**Date:** 2026-03-12
**Status:** Approved

## Overview

Flatten the `solution/` wrapper folder so the monorepo workspace root becomes the repo root. Rename `sites/learn` to `site`. Move eslint and prettier configs into a `config/` subfolder.

## Target Directory Structure

```
rokkit/                        ← repo root = workspace root
  packages/                    ← moved from solution/packages/
  site/                        ← moved + renamed from solution/sites/learn/
  config/
    eslint.config.mjs          ← moved from solution/
    .prettierrc                ← moved from solution/
    .prettierignore            ← moved from solution/
  agents/                      ← unchanged
  docs/                        ← unchanged
  package.json                 ← moved from solution/package.json
  bun.lock                     ← moved from solution/bun.lock
  vitest.config.ts             ← moved from solution/ (stays at root)
  tsconfig.json                ← moved from solution/ (stays at root)
  svelte.config.js             ← moved from solution/ (stays at root)
  bump.config.js               ← moved from solution/ (stays at root)
  CLAUDE.md                    ← unchanged
  vercel.json                  ← unchanged
  README.md, LICENSE, etc.     ← unchanged
```

`solution/` is deleted after migration.

## Why Some Configs Stay at Root

| File | Reason |
|------|--------|
| `vitest.config.ts` | Project roots (`packages/actions`, `site/`) resolve relative to config file location — moving would require `../` prefix on all paths and shifts the Vitest root |
| `tsconfig.json` | VS Code TS language server walks up directories looking for it by name; moving breaks editor features |
| `svelte.config.js` | SvelteKit's Vite plugin requires it at the workspace root |
| `bump.config.js` | bumpp has no `--config` flag for custom config path |

## Config Folder Integration

**ESLint:** Script updated to pass explicit path:
```json
"lint": "eslint --config config/eslint.config.mjs --fix"
```

**Prettier:** Add `"prettier"` field to `package.json` so both CLI and editor plugins (VS Code) respect the relocated config:
```json
"prettier": "./config/.prettierrc"
```
Script updated:
```json
"format": "prettier --config config/.prettierrc --ignore-path config/.prettierignore --write ."
```

## Required File Updates

### `package.json`
- Workspaces: `"./sites/*"` → `["./packages/*", "./site"]`
- Add `"prettier": "./config/.prettierrc"` field
- Scripts: `cd sites/learn` → `cd site`
- `build:all` / `publish:all`: `find ./packages` — unchanged
- `bump.config.js`: `sites/*/package.json` → `site/package.json`

### `vitest.config.ts`
- Project root: `root: 'sites/learn'` → `root: 'site'`
- Aliases: `./sites/learn/src/lib` → `./site/src/lib`, same for `$app`
- Coverage exclude: `**/sites/**` → `**/site/**`

### `config/eslint.config.mjs` (after move)
- Ignores referencing `sites/learn/...` → `site/...`
- File patterns `**/sites/*/src/**` → `**/site/src/**`
- `**/sites/learn/src/**` → `**/site/src/**`

### `bump.config.js`
- `sites/*/package.json` → `site/package.json`

### `vercel.json`
- Add `"rootDirectory": "site"` so Vercel builds from the SvelteKit project root

### `agents/` and `CLAUDE.md`
- All references to `solution/` paths updated to repo root
- `cd solution && bun run ...` → `bun run ...`
- `sites/learn` references → `site`

## Migration Approach

Use `git mv` for all moves to preserve file history:

```bash
# From repo root
git mv solution/packages packages
git mv solution/sites/learn site
git mv solution/package.json package.json
git mv solution/bun.lock bun.lock
git mv solution/vitest.config.ts vitest.config.ts
git mv solution/tsconfig.json tsconfig.json
git mv solution/svelte.config.js svelte.config.js
git mv solution/bump.config.js bump.config.js
mkdir config
git mv solution/eslint.config.mjs config/eslint.config.mjs
git mv solution/.prettierrc config/.prettierrc
git mv solution/.prettierignore config/.prettierignore
rmdir solution/sites
rmdir solution
```

## Out of Scope

- No changes to package source code or imports (`@rokkit/*` names unchanged)
- No changes to individual package `package.json` files
- No changes to Playwright e2e test files (paths inside `site/` are relative)
- No split of `site/` into sub-sites
