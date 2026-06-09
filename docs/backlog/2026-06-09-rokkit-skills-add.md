# `rokkit skills add` — ship AI skills with the CLI

**Status:** Spec — approved 2026-06-09, ready to plan

## Summary

Add a `rokkit skills` command to `@rokkit/cli` that installs curated AI skills
(SKILL.md guides) into a consumer's project under `.claude/skills/`. Skills are
bundled inside the published CLI package, so `rokkit skills add` works offline
and is version-locked to the Rokkit the project already uses. v1 ships two
consumer-facing skills: `semantic-styles-rokkit` (theming/tokens) and a net-new
`rokkit-components` (data-first component usage).

## Why now

The `semantic-styles-rokkit` skill already exists (in a developer's global
`~/.claude/skills/`) and measurably improves how agents write Rokkit theming
code. Putting it — and a component-usage companion — into the repo and behind a
CLI verb lets any team adopt them with one command, the same way they run
`rokkit init` / `rokkit doctor`.

## Decisions (locked during brainstorming)

1. **Catalog (v1):** `semantic-styles-rokkit` + `rokkit-components` (consumer
   usage). `new-component.md` stays an internal repo skill (contributor
   audience) and is a *source* for distilling `rokkit-components`, not shipped.
2. **Distribution:** skills are bundled in `@rokkit/cli` itself — no separate
   `@rokkit/skills` package, no `docs/skills`, no build-time copy.
3. **Canonical location:** `packages/cli/skills/<name>/SKILL.md` (+ optional
   supporting files), committed.
4. **Install target:** project-local `.claude/skills/<name>/` (committed into the
   consumer's repo, shared with their team). `--global` / `--target` are
   deliberately deferred as additive future options.
5. **Command surface:** `list` + `add [names...]` with `--all`, `--force`, and
   interactive multi-select when `add` is given no names.

## Architecture

### Packaging

- Canonical skills live at `packages/cli/skills/<name>/`.
- `packages/cli/package.json` `files` gains `"skills/**"` so the directory is
  included by `bun pm pack` (the existing publish flow in
  `.github/workflows/publish.yml`). No change to `prepublishOnly`.
- The CLI resolves the catalog directory relative to its own module:
  `new URL('../skills/', import.meta.url)`. This is `packages/cli/skills/` in
  dev/test and `node_modules/@rokkit/cli/skills/` once installed — one code
  path, both worlds. (`@rokkit/cli` ships `src/**/*.js` and is ESM, so
  `import.meta.url` resolution is available at runtime.)

### Catalog model

- No manifest file. The catalog is derived by scanning `skills/*/` for a
  `SKILL.md` and parsing its YAML frontmatter `name` and `description`.
- Adding a skill later = drop a `<name>/` folder in. `add` copies the **entire**
  `<name>/` directory, so multi-file skills (SKILL.md + supporting files) work.

### CLI module — `packages/cli/src/skills.js`

Pure, testable functions plus a thin command handler:

- `listSkills()` → `Array<{ name, description }>` read from the bundled catalog
  frontmatter, sorted by name.
- `installSkills(names, { cwd, force = false })` → for each requested name,
  copies `skills/<name>/` → `<cwd>/.claude/skills/<name>/`. Creates
  `.claude/skills/` if missing. Returns
  `Array<{ name, status: 'added' | 'skipped' | 'unknown' }>`:
  - `added` — copied.
  - `skipped` — destination already exists and `force` is false.
  - `unknown` — no such skill in the catalog.
- A handler wiring the subcommands:
  - `rokkit skills list` — print `name — description`, marking already-installed
    skills with a `✓`.
  - `rokkit skills add [names...]` — install the named skills.
  - `rokkit skills add` (no names) — interactive multi-select via `prompts`
    (same dependency/pattern as `init`).
  - `--all` — install the whole catalog.
  - `--force` — overwrite an existing `.claude/skills/<name>/`.

Registered in the CLI entry point alongside `init` / `doctor` / `skin` / `theme`.

### Error handling

- Unknown name → reported as `unknown` in the result; the handler prints a
  friendly message listing valid names and exits non-zero.
- Existing skill without `--force` → `skipped` with a one-line note (never
  clobbered).
- Missing `.claude/skills/` → created.
- Each `add` prints a per-skill outcome line (`added to .claude/skills/<name>`).

## Skill content

### `semantic-styles-rokkit`

Move the current global skill into `packages/cli/skills/semantic-styles-rokkit/SKILL.md`
verbatim (it already includes the SSR `themeHook` / `defaultMode: 'system'`
step). This repo copy becomes canonical going forward.

### `rokkit-components` (net-new, consumer usage)

Scope (Q5-A — "how to *use* Rokkit components", not internals):

- The data-first contract: `items`, bindable `value`, `fields` field-mapping,
  `onchange` / `onselect`.
- Snippet-based customization (named snippets per component).
- Keyboard navigation + accessibility as a *consumer* wires it (not the
  controller/navigator internals).
- A "which component when" map across the families (List, Tree, Select,
  MultiSelect, Menu, Table, Tabs, …).
- A handful of canonical usage recipes.

Distilled in part from `new-component.md` (data-attribute, fields/proxy, snippet,
and consumer-relevant nav sections) and the `@rokkit/*` package llms docs.
Exact depth is a planning sub-question; A-scope is the target.

## Testing

- `packages/cli/spec/skills.spec.js` (mirrors `init.spec.js`'s temp-dir style):
  - `listSkills()` returns the catalog (both v1 skills present, each with a
    non-empty description).
  - `installSkills(['semantic-styles-rokkit'], { cwd: tmp })` writes
    `<tmp>/.claude/skills/semantic-styles-rokkit/SKILL.md`; re-running returns
    `skipped`; with `{ force: true }` returns `added`.
  - An unknown name returns `unknown` and writes nothing.
  - `installSkills(['rokkit-components'], { cwd: tmp })` likewise.
- A catalog-integrity test: every `skills/*/SKILL.md` parses to frontmatter with
  non-empty `name` and `description`, and `name` matches the directory name.

## Docs & rollout

- README gains an **"AI skills"** section documenting `rokkit skills list` and
  `rokkit skills add`, linking to `packages/cli/skills/` for browsing.
- Ships as a normal `v1.1.x` patch release via the existing
  `bun run bump patch` flow; `develop → main` merge as usual.
- Add a one-line entry to `docs/design/12-priority.md` and a journal note on
  completion.

## Out of scope (v1)

- `--global` / `--target` install locations and non-Claude agent formats
  (AGENTS.md, `.cursor/rules`) — additive later via a target adapter.
- A separate `@rokkit/skills` package and any remote/`degit` fetch.
- Shipping the contributor `new-component` skill through the catalog.
- `rokkit doctor` suggesting skill installation.

## Open questions (for planning)

- Final depth/outline of the `rokkit-components` skill body (A-scope is agreed;
  the section list is a plan detail).
- Whether `rokkit skills list` should also show a short install hint when the
  catalog is empty (edge case; likely a one-liner).

## Deliverable

`@rokkit/cli` with `rokkit skills list` / `rokkit skills add`, two bundled skills
(`semantic-styles-rokkit`, `rokkit-components`), tests, and README docs —
released on the standard patch cadence.
