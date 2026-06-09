# `rokkit skills add` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `rokkit skills list` / `rokkit skills add` command to `@rokkit/cli` that installs curated AI skills (bundled in the package) into a consumer's `.claude/skills/`.

**Architecture:** Skills live committed at `packages/cli/skills/<name>/SKILL.md` and ship inside `@rokkit/cli` via `files: ["skills/**"]`. A new ESM module `packages/cli/src/skills.js` resolves that directory relative to its own module (`import.meta.url`), derives the catalog from each `SKILL.md`'s YAML frontmatter (no manifest), and copies whole skill folders into `<cwd>/.claude/skills/<name>/`. Commands are wired with `sade`, mirroring `init`/`skin`/`theme`. Pure functions take injectable options (`skillsDir`, `cwd`) for testing, matching the `skin.js` adapter pattern.

**Tech Stack:** Node ESM, `sade` (CLI), `prompts` (interactive multiselect), `node:fs` `cpSync` (recursive copy), Vitest (`packages/cli` project).

**Spec:** `docs/backlog/2026-06-09-rokkit-skills-add.md`

**Conventions to follow (read first):**
- `packages/cli/src/skin.js` — module shape: pure exported functions + a `console.*` output layer + an entry function; injectable adapters for tests.
- `packages/cli/src/index.js` — `sade` command registration; subcommands like `skin list` are registered as the two-word string `'skin list'`; extra positional args arrive on `opts._`.
- `packages/cli/spec/init.spec.js` — Vitest style (`import { describe, it, expect } from 'vitest'`, direct function calls).
- All CLI modules start with `/* eslint-disable no-console */` and use `console.info` / `console.warn` / `console.error`.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `packages/cli/skills/semantic-styles-rokkit/SKILL.md` (create) | Bundled theming skill (copied from canonical global skill) |
| `packages/cli/skills/rokkit-components/SKILL.md` (create) | Bundled consumer component-usage skill (net-new) |
| `packages/cli/src/skills.js` (create) | `parseFrontmatter`, `listSkills`, `installSkills`, `runSkillsList`, `runSkillsAdd`, `skillsCommand` |
| `packages/cli/spec/skills.spec.js` (create) | Unit tests for the above |
| `packages/cli/src/index.js` (modify) | Register `skills list` and `skills add` commands |
| `packages/cli/package.json` (modify) | Add `"skills/**"` to `files` |
| `packages/cli/README.md` (modify) | Add "AI skills" section |
| `docs/design/12-priority.md` (modify) | Add a completion entry |
| `agents/journal.md` (modify) | Log on completion |

---

## Task 1: Bundle the `semantic-styles-rokkit` skill

**Files:**
- Create: `packages/cli/skills/semantic-styles-rokkit/SKILL.md`

The canonical source is the developer's global skill at
`~/.claude/skills/semantic-styles-rokkit/SKILL.md` (already updated with the SSR
`themeHook` / `defaultMode: 'system'` step). Copy it verbatim — this repo copy
becomes canonical going forward.

- [ ] **Step 1: Create the directory and copy the skill**

```bash
mkdir -p packages/cli/skills/semantic-styles-rokkit
cp ~/.claude/skills/semantic-styles-rokkit/SKILL.md \
   packages/cli/skills/semantic-styles-rokkit/SKILL.md
```

- [ ] **Step 2: Verify the frontmatter copied intact**

Run: `head -3 packages/cli/skills/semantic-styles-rokkit/SKILL.md`
Expected: the first three lines are

```
---
name: semantic-styles-rokkit
description: Use when building, styling, or auditing a Rokkit-powered app ...
```

- [ ] **Step 3: Commit**

```bash
git add packages/cli/skills/semantic-styles-rokkit/SKILL.md
git commit -m "feat(cli): bundle semantic-styles-rokkit skill"
```

---

## Task 2: Author the `rokkit-components` skill

**Files:**
- Create: `packages/cli/skills/rokkit-components/SKILL.md`

Net-new consumer-usage skill. The **frontmatter below is exact** (the catalog
test asserts the name). The body is authored prose — follow the structure and
voice of `semantic-styles-rokkit` (concise, "use X not Y" tables, runnable
snippets). Source material: distill the consumer-relevant parts of
`.claude/skills/new-component.md` (data-attribute conventions, `fields`/proxy,
snippet usage, keyboard-nav as a consumer sees it) and the `@rokkit/*` package
docs under `docs/llms/packages/` and `docs/llms/components/`.

- [ ] **Step 1: Create the skill file with exact frontmatter + the required section outline**

Create `packages/cli/skills/rokkit-components/SKILL.md` beginning with exactly:

```markdown
---
name: rokkit-components
description: Use when building UI with Rokkit components in a Svelte 5 app — the data-first contract (items, bindable value, fields field-mapping, onchange/onselect), snippet-based customization, keyboard navigation + ARIA as a consumer wires it, and which component to reach for (List, Tree, Select, MultiSelect, Menu, Table, Tabs, …).
---

# Rokkit Components — Usage

## The data-first contract
<!-- items, bindable value, fields field-mapping, onchange/onselect; one runnable example -->

## Field mapping (fields)
<!-- how `fields` maps arbitrary data shapes to label/value/children/icon; default fields -->

## Snippet customization
<!-- named snippets per component; example overriding item rendering -->

## Keyboard navigation & accessibility
<!-- what works out of the box; how a consumer wires focus/selection; ARIA notes -->

## Which component when
<!-- table: List / Tree / Select / MultiSelect / Menu / Table / Tabs / Toggle — pick-by-need -->

## Recipes
<!-- 3-4 canonical snippets: a select bound to value, a tree with children fields,
     a multi-select with chips, a table with field mapping -->
```

Fill each section with real, runnable Svelte 5 snippets. Keep the whole file
focused on **using** components (not building them). Target ~150–300 lines.

- [ ] **Step 2: Verify the frontmatter**

Run: `head -3 packages/cli/skills/rokkit-components/SKILL.md`
Expected:

```
---
name: rokkit-components
description: Use when building UI with Rokkit components in a Svelte 5 app ...
```

- [ ] **Step 3: Commit**

```bash
git add packages/cli/skills/rokkit-components/SKILL.md
git commit -m "feat(cli): add rokkit-components usage skill"
```

---

## Task 3: `skills.js` — frontmatter parsing + catalog listing

**Files:**
- Create: `packages/cli/src/skills.js`
- Test: `packages/cli/spec/skills.spec.js`

- [ ] **Step 1: Write the failing test**

Create `packages/cli/spec/skills.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { parseFrontmatter, listSkills } from '../src/skills.js'

describe('parseFrontmatter', () => {
	it('extracts name and description from a frontmatter block', () => {
		const md = '---\nname: foo\ndescription: Bar baz qux\n---\n# Foo\n'
		expect(parseFrontmatter(md)).toEqual({ name: 'foo', description: 'Bar baz qux' })
	})

	it('returns empty strings when frontmatter is missing', () => {
		expect(parseFrontmatter('# no frontmatter here')).toEqual({ name: '', description: '' })
	})
})

describe('listSkills (bundled catalog)', () => {
	it('includes both v1 skills, each with a non-empty description', () => {
		const skills = listSkills()
		const names = skills.map((s) => s.name)
		expect(names).toContain('semantic-styles-rokkit')
		expect(names).toContain('rokkit-components')
		for (const s of skills) {
			expect(s.name).toBeTruthy()
			expect(s.description.length).toBeGreaterThan(0)
		}
	})

	it('is sorted by name', () => {
		const names = listSkills().map((s) => s.name)
		expect(names).toEqual([...names].sort())
	})
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bunx vitest run packages/cli/spec/skills.spec.js`
Expected: FAIL — `Failed to resolve import "../src/skills.js"`.

- [ ] **Step 3: Write the minimal implementation**

Create `packages/cli/src/skills.js`:

```js
/* eslint-disable no-console */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

// The catalog ships inside the package: packages/cli/skills/ in dev/test,
// node_modules/@rokkit/cli/skills/ once installed. One relative path, both worlds.
const DEFAULT_SKILLS_DIR = fileURLToPath(new URL('../skills/', import.meta.url))

/**
 * Parse `name` and `description` from a SKILL.md YAML frontmatter block.
 * @param {string} md
 * @returns {{ name: string, description: string }}
 */
export function parseFrontmatter(md) {
	const block = md.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
	const field = (key) => block.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1].trim() ?? ''
	return { name: field('name'), description: field('description') }
}

/**
 * Read the bundled skill catalog (derived from each SKILL.md's frontmatter).
 * @param {{ skillsDir?: string }} [opts]
 * @returns {Array<{ name: string, description: string }>}
 */
export function listSkills({ skillsDir = DEFAULT_SKILLS_DIR } = {}) {
	if (!existsSync(skillsDir)) return []
	return readdirSync(skillsDir)
		.filter((entry) => existsSync(join(skillsDir, entry, 'SKILL.md')))
		.map((entry) => parseFrontmatter(readFileSync(join(skillsDir, entry, 'SKILL.md'), 'utf-8')))
		.filter((s) => s.name)
		.sort((a, b) => a.name.localeCompare(b.name))
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bunx vitest run packages/cli/spec/skills.spec.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/skills.js packages/cli/spec/skills.spec.js
git commit -m "feat(cli): skills catalog listing from frontmatter"
```

---

## Task 4: `skills.js` — install skills into `.claude/skills/`

**Files:**
- Modify: `packages/cli/src/skills.js`
- Test: `packages/cli/spec/skills.spec.js`

- [ ] **Step 1: Write the failing test**

Append to `packages/cli/spec/skills.spec.js` (and add `installSkills` to the
existing import from `../src/skills.js`, plus the new imports below):

```js
import { mkdtempSync, rmSync, existsSync as fsExists } from 'node:fs'
import { tmpdir } from 'node:os'
import { join as pjoin } from 'node:path'
import { installSkills } from '../src/skills.js'

describe('installSkills', () => {
	let cwd
	beforeEach(() => {
		cwd = mkdtempSync(pjoin(tmpdir(), 'rokkit-skills-'))
	})
	afterEach(() => {
		rmSync(cwd, { recursive: true, force: true })
	})

	it('copies a skill into .claude/skills/<name>/', () => {
		const res = installSkills(['semantic-styles-rokkit'], { cwd })
		expect(res).toEqual([{ name: 'semantic-styles-rokkit', status: 'added' }])
		expect(fsExists(pjoin(cwd, '.claude/skills/semantic-styles-rokkit/SKILL.md'))).toBe(true)
	})

	it('installs rokkit-components too', () => {
		expect(installSkills(['rokkit-components'], { cwd })[0].status).toBe('added')
		expect(fsExists(pjoin(cwd, '.claude/skills/rokkit-components/SKILL.md'))).toBe(true)
	})

	it('skips an existing skill unless force is set', () => {
		installSkills(['semantic-styles-rokkit'], { cwd })
		expect(installSkills(['semantic-styles-rokkit'], { cwd })[0].status).toBe('skipped')
		expect(installSkills(['semantic-styles-rokkit'], { cwd, force: true })[0].status).toBe('added')
	})

	it('reports unknown skills and writes nothing for them', () => {
		const res = installSkills(['does-not-exist'], { cwd })
		expect(res).toEqual([{ name: 'does-not-exist', status: 'unknown' }])
		expect(fsExists(pjoin(cwd, '.claude/skills/does-not-exist'))).toBe(false)
	})

	it('every catalog skill is installable by its listed name (frontmatter name === dir)', () => {
		for (const s of listSkills()) {
			expect(installSkills([s.name], { cwd, force: true })).toEqual([
				{ name: s.name, status: 'added' }
			])
		}
	})
})
```

Update the top import line to:

```js
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bunx vitest run packages/cli/spec/skills.spec.js`
Expected: FAIL — `installSkills is not a function` / `not exported`.

- [ ] **Step 3: Write the minimal implementation**

Add to `packages/cli/src/skills.js` (extend the `node:fs` import to include
`mkdirSync` and `cpSync`, and `resolve` from `node:path`):

```js
import { readFileSync, readdirSync, existsSync, mkdirSync, cpSync } from 'node:fs'
import { join, resolve } from 'node:path'
```

```js
/**
 * Copy named skills into <cwd>/.claude/skills/<name>/ (idempotent).
 * @param {string[]} names
 * @param {{ cwd?: string, force?: boolean, skillsDir?: string }} [opts]
 * @returns {Array<{ name: string, status: 'added' | 'skipped' | 'unknown' }>}
 */
export function installSkills(
	names,
	{ cwd = process.cwd(), force = false, skillsDir = DEFAULT_SKILLS_DIR } = {}
) {
	const targetRoot = resolve(cwd, '.claude', 'skills')
	return names.map((name) => {
		const src = join(skillsDir, name)
		if (!existsSync(join(src, 'SKILL.md'))) return { name, status: 'unknown' }
		const dest = join(targetRoot, name)
		if (existsSync(dest) && !force) return { name, status: 'skipped' }
		mkdirSync(targetRoot, { recursive: true })
		cpSync(src, dest, { recursive: true })
		return { name, status: 'added' }
	})
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bunx vitest run packages/cli/spec/skills.spec.js`
Expected: PASS (8 tests total).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/skills.js packages/cli/spec/skills.spec.js
git commit -m "feat(cli): install skills into .claude/skills"
```

---

## Task 5: Command handlers + `sade` wiring

**Files:**
- Modify: `packages/cli/src/skills.js`
- Modify: `packages/cli/src/index.js`
- Test: `packages/cli/spec/skills.spec.js`

The interactive prompt path (no names given) is not unit-tested (it requires a
TTY); tests cover the explicit-names and `--all` paths, which skip the prompt.

- [ ] **Step 1: Write the failing test**

Append to `packages/cli/spec/skills.spec.js` (add `runSkillsAdd` to the import):

```js
import { runSkillsAdd } from '../src/skills.js'

describe('runSkillsAdd (no prompt when names or --all given)', () => {
	let cwd
	beforeEach(() => {
		cwd = mkdtempSync(pjoin(tmpdir(), 'rokkit-skills-'))
	})
	afterEach(() => {
		rmSync(cwd, { recursive: true, force: true })
	})

	it('installs explicitly-named skills without prompting', async () => {
		await runSkillsAdd(['rokkit-components'], { cwd })
		expect(fsExists(pjoin(cwd, '.claude/skills/rokkit-components/SKILL.md'))).toBe(true)
	})

	it('--all installs the entire catalog', async () => {
		await runSkillsAdd([], { cwd, all: true })
		expect(fsExists(pjoin(cwd, '.claude/skills/semantic-styles-rokkit/SKILL.md'))).toBe(true)
		expect(fsExists(pjoin(cwd, '.claude/skills/rokkit-components/SKILL.md'))).toBe(true)
	})
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bunx vitest run packages/cli/spec/skills.spec.js`
Expected: FAIL — `runSkillsAdd is not a function`.

- [ ] **Step 3: Write the implementation**

Add to `packages/cli/src/skills.js` (add `import prompts from 'prompts'` at the top):

```js
/**
 * Print the catalog, marking already-installed skills.
 * @param {{ skillsDir?: string, cwd?: string }} [opts]
 */
export async function runSkillsList({ skillsDir, cwd = process.cwd() } = {}) {
	const catalog = listSkills({ skillsDir })
	if (catalog.length === 0) {
		console.info('No skills available.')
		return
	}
	const installedRoot = resolve(cwd, '.claude', 'skills')
	console.info('Available Rokkit skills:\n')
	for (const s of catalog) {
		const mark = existsSync(join(installedRoot, s.name, 'SKILL.md')) ? '✓ ' : '  '
		console.info(`${mark}${s.name}`)
		console.info(`     ${s.description}`)
	}
	console.info('\nInstall with: rokkit skills add <name> [...]   (or --all)')
}

/**
 * Resolve which skills to install, then copy and report.
 * @param {string[]} names
 * @param {{ all?: boolean, force?: boolean, skillsDir?: string, cwd?: string }} [opts]
 */
export async function runSkillsAdd(names, { all = false, force = false, skillsDir, cwd = process.cwd() } = {}) {
	const catalog = listSkills({ skillsDir })
	let selected = names
	if (all) {
		selected = catalog.map((s) => s.name)
	} else if (selected.length === 0) {
		const res = await prompts({
			type: 'multiselect',
			name: 'picked',
			message: 'Select skills to add',
			choices: catalog.map((s) => ({ title: s.name, value: s.name, description: s.description }))
		})
		selected = res.picked ?? []
	}
	if (selected.length === 0) {
		console.info('No skills selected.')
		return
	}
	const results = installSkills(selected, { cwd, force, skillsDir })
	for (const r of results) {
		if (r.status === 'added') console.info(`  added .claude/skills/${r.name}`)
		else if (r.status === 'skipped') console.info(`  skipped ${r.name} (exists — use --force to overwrite)`)
		else console.error(`  unknown skill: ${r.name}`)
	}
	if (results.some((r) => r.status === 'unknown')) {
		console.error(`\nValid skills: ${catalog.map((s) => s.name).join(', ')}`)
		process.exitCode = 1
	}
}

/**
 * CLI entry for `rokkit skills` subcommands.
 * @param {'list' | 'add'} sub
 * @param {{ _?: string[], all?: boolean, force?: boolean }} [opts]
 */
export async function skillsCommand(sub, opts = {}) {
	if (sub === 'add') {
		await runSkillsAdd(opts._ ?? [], { all: opts.all, force: opts.force })
	} else {
		await runSkillsList()
	}
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bunx vitest run packages/cli/spec/skills.spec.js`
Expected: PASS (10 tests total).

- [ ] **Step 5: Wire the commands into the CLI entry**

In `packages/cli/src/index.js`, add after the `theme create` command block
(before `prog.parse(process.argv)`):

```js
prog
	.command('skills list')
	.describe('List available Rokkit AI skills')
	.action(async () => {
		const { skillsCommand } = await import('./skills.js')
		await skillsCommand('list')
	})

prog
	.command('skills add')
	.describe('Add Rokkit AI skills to .claude/skills/')
	.option('--all', 'Install all available skills')
	.option('--force', 'Overwrite an existing skill')
	.action(async (opts) => {
		const { skillsCommand } = await import('./skills.js')
		await skillsCommand('add', opts)
	})
```

(`sade` places positional skill names on `opts._`, which `skillsCommand` reads.)

- [ ] **Step 6: Manually smoke-test the wired CLI**

Run:
```bash
node packages/cli/src/index.js skills list
```
Expected: prints both skills with descriptions and the install hint.

Run (in a throwaway temp dir):
```bash
TMP=$(mktemp -d) && (cd "$TMP" && node "$OLDPWD/packages/cli/src/index.js" skills add rokkit-components) && ls "$TMP/.claude/skills/rokkit-components" && rm -rf "$TMP"
```
Expected: prints `added .claude/skills/rokkit-components` and lists `SKILL.md`.

- [ ] **Step 7: Commit**

```bash
git add packages/cli/src/skills.js packages/cli/src/index.js packages/cli/spec/skills.spec.js
git commit -m "feat(cli): wire 'rokkit skills list|add' commands"
```

---

## Task 6: Package the skills into the published tarball

**Files:**
- Modify: `packages/cli/package.json`

- [ ] **Step 1: Add `skills/**` to `files`**

In `packages/cli/package.json`, change the `files` array to include the skills
directory (add the one line shown):

```json
	"files": [
		"lib/**/*",
		"src/**/*.js",
		"skills/**",
		"dist/**/*.d.ts",
		"README.md",
		"package.json",
		"LICENSE"
	],
```

- [ ] **Step 2: Verify the skills are included in the packed tarball**

Run:
```bash
cd packages/cli && bun pm pack --dry-run 2>&1 | grep -c "skills/.*SKILL.md"; cd -
```
Expected: `2` (both `SKILL.md` files are listed in the pack contents).

> If `--dry-run` is unsupported in the installed bun, run `cd packages/cli && bun pm pack` then `tar -tzf *.tgz | grep skills` and `rm -f *.tgz`. Expected: both `package/skills/semantic-styles-rokkit/SKILL.md` and `package/skills/rokkit-components/SKILL.md` appear.

- [ ] **Step 3: Commit**

```bash
git add packages/cli/package.json
git commit -m "build(cli): include skills/ in published package"
```

---

## Task 7: README docs + project bookkeeping

**Files:**
- Modify: `packages/cli/README.md`
- Modify: `docs/design/12-priority.md`
- Modify: `agents/journal.md`

- [ ] **Step 1: Add an "AI skills" section to the CLI README**

Append to `packages/cli/README.md`:

```markdown
## AI skills

Rokkit ships curated AI skills (SKILL.md guides) that teach coding agents how to
use the library well — theming with the named-token system and building UI with
the components.

```bash
rokkit skills list                       # see the catalog
rokkit skills add semantic-styles-rokkit # install one
rokkit skills add                        # interactive multi-select
rokkit skills add --all                  # install everything
rokkit skills add <name> --force         # overwrite an existing install
```

Skills install into your project's `.claude/skills/<name>/`, so they're shared
with your team via version control. Browse the source under
[`packages/cli/skills/`](./skills).
```

- [ ] **Step 2: Verify the README renders the code fences correctly**

Run: `sed -n '/## AI skills/,/packages\/cli\/skills/p' packages/cli/README.md`
Expected: the new section prints with intact code fences.

- [ ] **Step 3: Add a priority-checklist entry**

In `docs/design/12-priority.md`, under `## Open` → `#### Developer Utilities`,
add:

```markdown
- [x] **`rokkit skills add` — ship AI skills with the CLI** — Shipped 2026-06-09. `rokkit skills list` / `rokkit skills add [names] [--all] [--force]` install bundled SKILL.md guides into a consumer's `.claude/skills/`. v1 catalog: `semantic-styles-rokkit` + `rokkit-components`. Skills live in `packages/cli/skills/` and ride the published package. See journal 2026-06-09.
```

- [ ] **Step 4: Add a journal entry**

Append a dated entry to `agents/journal.md` summarizing the feature, the two
shipped skills, and the commit range (fill in the actual hashes from
`git log --oneline`).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/README.md docs/design/12-priority.md agents/journal.md
git commit -m "docs(cli): document 'rokkit skills' + update priority/journal"
```

---

## Task 8: Full verification

- [ ] **Step 1: Run the full CLI test suite**

Run: `bunx vitest run packages/cli`
Expected: all CLI test files pass (previous 113 + the new `skills.spec.js` tests).

- [ ] **Step 2: Lint the changed files**

Run: `bunx eslint --config config/eslint.config.mjs packages/cli/src/skills.js packages/cli/src/index.js packages/cli/spec/skills.spec.js`
Expected: 0 errors.

- [ ] **Step 3: Type-check**

Run: `cd packages/cli && bunx tsc --noEmit; cd -`
Expected: no errors (or only pre-existing ones unrelated to these files).

---

## Release (after plan completion — only when the user authorizes)

This is a `@rokkit/cli` feature → release with the existing flow:
`bun run bump patch --yes` (runs `check` = lint + types + `test:ci`, bumps,
commits, tags, pushes; CI publishes on the tag), then merge `develop → main`.
Note the unrelated `v1.1.13` CLI flash-script fix is already committed on
`develop` and will ship in the same release.
```
