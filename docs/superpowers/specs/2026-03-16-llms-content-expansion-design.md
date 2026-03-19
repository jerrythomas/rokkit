# LLMs Content Expansion Design

## Goal

Expand `docs/llms/` from a component-only reference into a complete LLM-facing documentation suite: an entry-point `index.txt` with setup workflow, a `cli.txt` reference, and per-package documentation.

## Problem

Currently `docs/llms/` documents components only. An LLM helping a developer set up or use Rokkit has no guidance on:

- How to install and configure Rokkit (the CLI workflow)
- How to verify and repair a broken setup
- What each non-UI package provides and how to use it
- How theming actually works (the existing section has incorrect attribute names)

## Scope

Two independent plans:

**Plan 1 — Entry point + CLI reference**

- Rewrite `docs/llms/index.txt` as a navigational entry point
- Create `docs/llms/cli.txt`
- Correct the theming section (supersedes `docs/superpowers/specs/2026-03-16-llms-txt-theming-docs.md`)

**Plan 2 — Package documentation**

- Create `docs/llms/packages/*.txt` — one file per non-UI package

---

## Plan 1: index.txt + cli.txt

### index.txt structure

`index.txt` becomes a structured entry point, not a flat reference. Sections:

1. **Quick Setup**
   - `npm create svelte@latest myapp && cd myapp`
   - `npx @rokkit/cli@latest init` — interactive prompts, files written
   - Emphasise: always use CLI, manual install leads to errors

2. **Verify & Fix**
   - `npx @rokkit/cli@latest doctor` — shows 4 checks with PASS/FAIL
   - `npx @rokkit/cli@latest doctor --fix` — auto-fixes 3 of 4 checks
   - Manual fix for `uno.config.js` (must replace preset line — not auto-fixable)

3. **Troubleshooting**
   - What each check means
   - Manual remediation steps for each failure
   - When `--fix` is not sufficient

4. **Theming** (corrected)
   - Correct data attributes: `data-style` (visual personality), `data-mode` (light/dark), `data-density` (compact/default/comfortable), `data-palette` (color skin)
   - UnoCSS utility classes: `bg-surface-z1`, `text-primary-z6`, `border-surface-z3`, etc.
   - Z-scale token system (z1–z10) — what it means across light/dark modes
   - Guidance: use utility classes, not inline CSS variables

5. **Navigation**
   - `cli.txt` — CLI reference
   - `packages/` — per-package documentation
   - `components/` — component reference (existing)
   - Keyboard navigation quick reference (inline section in `index.txt`, already exists — keep and correct if needed)

### cli.txt structure

New file at `docs/llms/cli.txt`:

- **`rokkit init`** — interactive prompts covering: color palette selection, custom colors (primary/secondary/accent/surface), icon collection, custom icon path, theme styles (multi-select: rokkit/minimal/material), and switcher mode (system/manual/full). Source of truth for prompt list: `packages/cli/src/init.js` (`PROMPTS_CONFIG` array). Files written: `rokkit.config.js`, `uno.config.js`, `src/app.css`, `src/app.html` — document what each contains.
- **`rokkit doctor`** — 4 checks, `--fix` flag, exit codes (0 = all pass, 1 = any failures; no other codes), which checks are auto-fixable, manual remediation for `uno-uses-preset`
- **Icon tools** — `rokkit bundle` and `rokkit build` (brief; for icon library authors)

---

## Plan 2: Package Documentation

New directory `docs/llms/packages/` with one `.txt` file per package.

Format mirrors `docs/llms/components/*.txt`: description → install → key exports → usage examples → related packages. Use `docs/llms/components/list.txt` as the canonical template reference.

**Boundary with `index.txt` theming section:** `index.txt` section 4 covers _how to apply_ theming (data attributes, utility classes, z-scale tokens — the usage API). `themes.txt` covers _what the theme system provides_ (available built-in themes, custom palettes, CSS import structure). Minimal overlap is acceptable; do not duplicate the data attribute reference.

### Files

| File          | Package           | Key Content                                                                     |
| ------------- | ----------------- | ------------------------------------------------------------------------------- |
| `actions.txt` | `@rokkit/actions` | `navigable`, `draggable`, other actions; how to apply; custom events dispatched |
| `states.txt`  | `@rokkit/states`  | State primitives and data structures                                            |
| `forms.txt`   | `@rokkit/forms`   | Full coverage — see below                                                       |
| `app.txt`     | `@rokkit/app`     | `ThemeSwitcher`, `ThemeSwitcherToggle`, `TableOfContents`; app-level chrome     |
| `core.txt`    | `@rokkit/core`    | Core utilities; what's exported and when to use                                 |
| `data.txt`    | `@rokkit/data`    | Data manipulation helpers                                                       |
| `themes.txt`  | `@rokkit/themes`  | Theme system; available themes; custom palettes; CSS import structure           |
| `unocss.txt`  | `@rokkit/unocss`  | `presetRokkit`; setup; utility classes; color tokens; dark mode                 |

### forms.txt — expanded coverage

`@rokkit/forms` is the most complex package and warrants deeper documentation:

- `createForm()` — schema definition, field types (canonical list: `packages/forms/src/` — read source to enumerate all supported types)
- `FormBuilder` API — `updateField()`, `isFieldDisabled()`, `refreshLookup()`
- `FormRenderer` — props, snippet/slot customization
- **Field types** — all supported types with code examples
- **Validation** — defining rules, error display
- **Lookups** — three modes: `url` (URL template), `fetch` (async hook), `source+filter` (sync client-side); dependent fields; `disabled` state lifecycle
- **Dynamic forms** — updating fields reactively based on other field values
- **Full end-to-end example** — a form with dependent lookups and validation

---

## What This Enables

- An LLM can walk a developer through full Rokkit setup using only the CLI, without any manual config errors
- Troubleshooting guide covers the cases `doctor --fix` cannot handle
- Per-package docs mean LLMs no longer default to guessing APIs
- Correct theming section prevents inline CSS variable fallback anti-pattern

## Relationship to the Learn Site

`docs/llms/*.txt` files are LLM-optimized: compact, precise, API-focused. The learn site (`site/`) covers the same topics in more depth with tutorials, screenshots, and worked examples. They should be **consistent** — no contradictions — but not identical. When content in `docs/llms/` is created or updated, the corresponding learn site pages should be checked for accuracy and updated if they conflict.
