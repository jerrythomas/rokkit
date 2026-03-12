# Repo Restructure Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Flatten `solution/` so the monorepo workspace root is the repo root, rename `sites/learn` to `site`, and move eslint/prettier configs into `config/`.

**Architecture:** All source files are moved using `git mv` to preserve history. Config files that reference old paths are updated in place. Node modules are reinstalled after the move. The `solution/` directory is deleted once emptied.

**Tech Stack:** git, bun workspaces, vitest, eslint flat config, prettier 3

---

## Pre-flight notes

- **Run all git commands from the repo root:** `/Users/Jerry/Developer/rokkit/`
- **Run all bun/test commands from the new workspace root** (also `/Users/Jerry/Developer/rokkit/`) after the move
- `node_modules/` is gitignored and will NOT be moved by `git mv` — it will be recreated by `bun install` after the move
- The `.svelte-kit/` dir (in `sites/learn`) is also gitignored — it will be recreated on first build/dev
- **Commit or stash any pending changes before starting.** Run `git status` first. If `solution/package.json` (or any other file) has unstaged modifications, stage them with `git add solution/package.json && git commit -m "chore: stash pending changes before restructure"` — `git mv` will carry working-tree changes along, but an explicit commit prevents confusion

---

## Chunk 1: Git moves

### Task 1: Move all tracked files to new locations

**Files:**
- Move: `solution/packages/` → `packages/`
- Move: `solution/sites/learn/` → `site/`
- Move: `solution/package.json` → `package.json`
- Move: `solution/bun.lock` → `bun.lock`
- Move: `solution/vitest.config.ts` → `vitest.config.ts`
- Move: `solution/tsconfig.json` → `tsconfig.json`
- Move: `solution/svelte.config.js` → `svelte.config.js`
- Move: `solution/bump.config.js` → `bump.config.js`
- Create: `config/` directory
- Move: `solution/eslint.config.mjs` → `config/eslint.config.mjs`
- Move: `solution/.prettierrc` → `config/.prettierrc`
- Move: `solution/.prettierignore` → `config/.prettierignore`

- [ ] **Step 1: Move packages and site**

Run from `/Users/Jerry/Developer/rokkit/`:
```bash
git mv solution/packages packages
git mv solution/sites/learn site
```

- [ ] **Step 2: Move workspace root files**

```bash
git mv solution/package.json package.json
git mv solution/bun.lock bun.lock
git mv solution/vitest.config.ts vitest.config.ts
git mv solution/tsconfig.json tsconfig.json
git mv solution/svelte.config.js svelte.config.js
git mv solution/bump.config.js bump.config.js
```

- [ ] **Step 3: Move configs to config/**

```bash
mkdir config
git mv solution/eslint.config.mjs config/eslint.config.mjs
git mv solution/.prettierrc config/.prettierrc
git mv solution/.prettierignore config/.prettierignore
```

- [ ] **Step 4: Remove now-empty solution/ directories**

After all `git mv` operations, `solution/` still contains gitignored artifacts (node_modules, .DS_Store, etc.) that `rmdir` cannot handle. Since all tracked content is already moved by git mv, it's safe to force-remove the remainder:

```bash
rm -rf solution
```

- [ ] **Step 5: Verify git staging looks correct**

```bash
git status --short | head -40
```

Expected: a large list of renames (`R  solution/packages/... -> packages/...`, etc.), no unexpected deletions.

**Do NOT commit yet** — configs need updating first.

---

## Chunk 2: Config file updates

### Task 2: Update root package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Update workspaces array**

In `package.json`, change:
```json
"workspaces": [
  "./packages/*",
  "./sites/*"
]
```
to:
```json
"workspaces": [
  "./packages/*",
  "./site"
]
```

- [ ] **Step 2: Update test:e2e script**

Change:
```json
"test:e2e": "cd sites/learn && npx playwright test"
```
to:
```json
"test:e2e": "cd site && npx playwright test"
```

- [ ] **Step 3: Add prettier config pointer**

Add a new top-level field so editors and CLI both find the config:
```json
"prettier": "./config/.prettierrc"
```

- [ ] **Step 4: Update format script**

Change:
```json
"format": "prettier --write ."
```
to:
```json
"format": "prettier --config config/.prettierrc --ignore-path config/.prettierignore --write ."
```

- [ ] **Step 5: Update lint script**

Change:
```json
"lint": "eslint --fix"
```
to:
```json
"lint": "eslint --config config/eslint.config.mjs --fix"
```

- [ ] **Step 6: Commit this task**

```bash
git add package.json
git commit -m "refactor: update workspace root package.json for repo restructure"
```

---

### Task 3: Update vitest.config.ts

**Files:**
- Modify: `vitest.config.ts`

- [ ] **Step 1: Update the learn project entry**

Find the project entry for `learn` (near the bottom of the projects array):
```ts
{
  extends: true,
  test: {
    name: 'learn',
    root: 'sites/learn'
  },
  resolve: {
    alias: {
      $lib: path.resolve('./sites/learn/src/lib'),
      $app: path.resolve('./sites/learn/src/app')
    }
  }
},
```

Replace with:
```ts
{
  extends: true,
  test: {
    name: 'learn',
    root: 'site'
  },
  resolve: {
    alias: {
      $lib: path.resolve('./site/src/lib'),
      $app: path.resolve('./site/src/app')
    }
  }
},
```

- [ ] **Step 2: Update coverage exclude**

Find:
```ts
exclude: ['**/spec/**', '**/node_modules/**', '**/dist/**', '**/sites/**', '**/fixtures/**', '**/types.ts']
```

Change `**/sites/**` → `**/site/**`:
```ts
exclude: ['**/spec/**', '**/node_modules/**', '**/dist/**', '**/site/**', '**/fixtures/**', '**/types.ts']
```

- [ ] **Step 3: Remove the testbed project entry**

The `testbed` package source files were deleted in an earlier session (all `packages/testbed/src/**` files are staged as deleted). The directory exists but has no source. Remove its entry from the `projects` array unconditionally:

Find and delete:
```ts
{ extends: true, test: { name: 'testbed', root: 'packages/testbed' } },
```

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts
git commit -m "refactor: update vitest project roots for repo restructure"
```

---

### Task 4: Update config/eslint.config.mjs

**Files:**
- Modify: `config/eslint.config.mjs`

- [ ] **Step 1: Update ignore paths that reference sites/learn**

Find in the `ignores` array:
```js
'sites/learn/src/routes/(learn)/customization/icons/fragments/**',
'sites/learn/src/routes/(learn)/elements/list/fragments/01-data-object.js',
'sites/learn/src/routes/(learn)/**/snippets/**'
```

Replace with:
```js
'site/src/routes/(learn)/customization/icons/fragments/**',
'site/src/routes/(learn)/elements/list/fragments/01-data-object.js',
'site/src/routes/(learn)/**/snippets/**'
```

- [ ] **Step 2: Update file glob patterns**

Find:
```js
{
  files: [
    '**/sites/*/src/routes/components/**',
    '**/sites/*/src/routes/playground/**',
    '**/examples/**',
    '**/stories/**',
    '**/fragments/**'
  ],
```

Replace:
```js
{
  files: [
    '**/site/src/routes/components/**',
    '**/site/src/routes/playground/**',
    '**/examples/**',
    '**/stories/**',
    '**/fragments/**'
  ],
```

- [ ] **Step 3: Update the sites/learn-specific rule block**

Find:
```js
{
  files: ['**/sites/learn/src/**'],
```

Replace with:
```js
{
  files: ['**/site/src/**'],
```

- [ ] **Step 4: Commit**

```bash
git add config/eslint.config.mjs
git commit -m "refactor: update eslint config paths for repo restructure"
```

---

### Task 5: Update bump.config.js and vercel.json

**Files:**
- Modify: `bump.config.js`
- Modify: `vercel.json`

- [ ] **Step 1: Update bump.config.js**

Current content:
```js
import { defineConfig } from 'bumpp'

export default defineConfig({
  files: ['package.json', 'packages/*/package.json', 'sites/*/package.json'],
  recursive: true
})
```

Change `sites/*/package.json` → `site/package.json`:
```js
import { defineConfig } from 'bumpp'

export default defineConfig({
  files: ['package.json', 'packages/*/package.json', 'site/package.json'],
  recursive: true
})
```

- [ ] **Step 2: Update vercel.json**

Current content at repo root:
```json
{
  "buildCommand": "bun run build",
  "installCommand": "bun install",
  "framework": "sveltekit"
}
```

Add `rootDirectory` so Vercel builds from the SvelteKit project:
```json
{
  "rootDirectory": "site",
  "buildCommand": "bun run build",
  "installCommand": "bun install",
  "framework": "sveltekit"
}
```

- [ ] **Step 3: Commit**

```bash
git add bump.config.js vercel.json
git commit -m "refactor: update bump and vercel config for repo restructure"
```

---

## Chunk 3: Site-internal path fixes

### Task 6: Fix relative paths inside site/

**Files:**
- Modify: `site/package.json`
- Modify: `site/uno.config.js`

- [ ] **Step 1: Update site/package.json build:themes script**

The site's `build:themes` script uses `../../packages/themes` which resolved correctly when the site was at `solution/sites/learn/`. Now at `site/`, it is one level shallower — the path must become `../packages/themes`.

In `site/package.json`, change:
```json
"build:themes": "cd ../../packages/themes && bun run build"
```
to:
```json
"build:themes": "cd ../packages/themes && bun run build"
```

- [ ] **Step 2: Update site/uno.config.js package references**

In `site/uno.config.js`, find:
```js
'../../packages/themes/src/**/*.css',
'../../packages/ui/src/**/*.svelte'
```

Replace with:
```js
'../packages/themes/src/**/*.css',
'../packages/ui/src/**/*.svelte'
```

- [ ] **Step 3: Commit**

```bash
git add site/package.json site/uno.config.js
git commit -m "refactor: fix relative paths in site after directory restructure"
```

---

## Chunk 4: Docs update and verification

### Task 7: Update agent docs and CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`
- Modify: `agents/memory.md`
- Modify: `agents/references.md`
- Modify: `agents/design-patterns.md`
- Modify: `docs/design/06-testing.md`
- Modify: `docs/design/05-website.md`
- Modify: `docs/design/03-forms.md` (if needed)

- [ ] **Step 1: Update CLAUDE.md**

Find:
```markdown
### Commands (run from `solution/`)
```
Replace with:
```markdown
### Commands (run from repo root)
```

Find:
```
cd sites/learn && npx playwright test
```
Replace with:
```
cd site && npx playwright test
```

Also update the repo structure section — change any `solution/packages/`, `solution/sites/learn` references to `packages/`, `site/`.

- [ ] **Step 2: Update agents/memory.md**

Find the repository structure table entry:
```
| `sites/learn` | Documentation site + interactive demos + e2e tests |
```
Replace with:
```
| `site` | Documentation site + interactive demos + e2e tests |
```

Also find and update any other `solution/` or `sites/learn` references in the file.

- [ ] **Step 3: Update agents/references.md**

Find (around line 186):
```
| `sites/learn` | ...
```
Replace with:
```
| `site` | ...
```

Search the whole file for `solution/` and `sites/learn` and update each occurrence.

- [ ] **Step 4: Update agents/design-patterns.md**

Find the reference to `sites/learn/uno.config.js` and replace with `site/uno.config.js`.

- [ ] **Step 5: Update docs/design/ files**

In `docs/design/06-testing.md`, update:
- `cd solution && bun run test:ci` → `bun run test:ci`
- `cd solution/sites/learn && npx playwright test` → `cd site && npx playwright test`
- Any `solution/packages/` references → `packages/`

In `docs/design/05-website.md`, update:
- All `sites/learn` references → `site`

In `docs/design/03-forms.md`, update:
- Any `solution/packages/forms/` references → `packages/forms/`

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md agents/memory.md agents/references.md agents/design-patterns.md docs/design/
git commit -m "docs: update all path references after repo restructure"
```

---

### Task 8: Reinstall dependencies and verify

- [ ] **Step 1: Delete old node_modules**

```bash
# From repo root /Users/Jerry/Developer/rokkit/
rm -rf node_modules
# Also clean any package-level node_modules that may have stale links
find packages -name node_modules -maxdepth 2 -exec rm -rf {} + 2>/dev/null || true
find site -name node_modules -maxdepth 2 -exec rm -rf {} + 2>/dev/null || true
```

- [ ] **Step 2: Reinstall from new workspace root**

```bash
bun install
```

Expected: bun resolves all workspaces (`@rokkit/ui`, `@rokkit/learn`, etc.) and prints no errors.

- [ ] **Step 3: Run all tests**

```bash
bun run test:ci
```

Expected: `Tests 2526 passed (2526)` — same count as before the restructure.

If tests fail, check:
- Vitest project roots point to correct directories
- `site` project resolves `$lib` alias correctly

- [ ] **Step 4: Run lint**

```bash
bun run lint
```

Expected: `0 errors` (warnings are pre-existing and acceptable).

- [ ] **Step 5: Final commit**

```bash
git add -A
git status  # verify nothing unexpected is staged
git commit -m "refactor: complete repo restructure — flatten solution/, rename sites/learn to site, move configs"
```

- [ ] **Step 6: Note for human**

The Claude Code session's working directory is currently `/Users/Jerry/Developer/rokkit/solution` which no longer exists after this task. The user will need to open a new terminal session or use `cd /Users/Jerry/Developer/rokkit` before running further commands.
