# Priority Checklist

A forward-looking work list of pending items. Organized by status; priority is a secondary tag within "Open".

Last updated: 2026-05-20 (full restructure — pulled completed items out of the main view)

**Source of truth for history:** `agents/journal.md`. This file is intentionally short. Per-task detail, commit hashes, and test counts live in journal entries dated to the work.

---

## Recently Shipped (since 2026-04-01)

Major design-system initiative — phases 3–9, then release 1 of the trimmed token vocabulary, then 1.x theme migrations:

- **Phase 3 (2026-04-28)** — Playwright visual baseline for `demo/`. Chromium snapshots across observatory / sessions / setup-wizard, multi-locale, multi-mode.
- **Phase 5.5 (2026-05-05)** — Zen-sumi theme: 25 component CSS files, OKLCH-native, ink-on-paper aesthetic.
- **Phase 6 (2026-05-07/08)** — Demo component migration: custom shells → `@rokkit/ui` (Tabs, Buttons, List nav, Stepper, Card, retro cards).
- **Phase 7 (2026-05-08)** — Token migration across all themes; literal-icon support (`[data-item-icon-literal]`).
- **Phase 8 (2026-05-08)** — Settings panel + live theme switcher; ThemePanel modernized.
- **Phase 9 (2026-05-11)** — Final e2e verification: 55 e2e tests, cross-theme visual regression (5 themes × light/dark).
- **ColorSpace adapter (2026-05-11)** — Pluggable color-space wrapping for palette values.
- **Semantic Ink + Extensible Roles (2026-05-12)** — `ink` role with inverted z-scale; alias validation; generalized dual-palette (any role accepts `{ light, dark }`).
- **Trimmed Token Vocabulary release 1 (2026-05-15)** — `tokens: 'core'` (new default) emits 18→24 named tokens (`--paper`, `--ink-mute`, `--accent-soft`, …) with palette values inlined; `tokens: 'extended'` preserves legacy ~120-var output; `custom` config block for app-level tokens; per-role tokens mode. ~120 → ~40 CSS vars per skin.
- **Trimmed Token Vocabulary release 1.x (post 2026-05-15)** — `base/*.css` + all style themes migrated to named vocabulary; `secondary` refs → `accent`; `buildNamedShortcuts` extracted for themes build.

---

## Open

### P2 — User Experience Enhancements

#### Developer Utilities

- [x] **`rokkit skills add` — ship AI skills with the CLI** — Shipped 2026-06-09. `rokkit skills list` / `rokkit skills add [names] [--all] [--force]` install bundled SKILL.md guides into a consumer's `.claude/skills/`. v1 catalog: `semantic-styles-rokkit` + `rokkit-components`. Skills live in `packages/cli/skills/` and ride the published package. See journal 2026-06-09.

- [x] **CLI + LLM-docs → named tokens** — Shipped 2026-06-06. `rokkit init` generates the named-token `skin` shape (rgb + new Zen-Sumi OKLCH starters, header comment); `rokkit doctor` writes a real starter on `--fix`, validates config shape, and gives advisory z-scale migration hints; `docs/llms/*` + `unocss/README.md` rewritten named-token-first. Breaking to generated config shape (`colors` → `skin`); existing configs work via the preset alias. See journal 2026-06-06.

- [x] **CodeGroup site component** — Shipped 2026-05-28. Tree-based (chosen over tabs since real projects have nested folders). Tree-rail on the left at ≥ 768px; collapses to a top picker pill that opens a drawer overlay on narrower viewports — code area gets full width on mobile. Optional `preview` Svelte snippet, collapsed by default with a "Show preview" toggle per spec. Shiki highlighting + copy button. Lives at `site/src/lib/components/CodeGroup.svelte`; playground at `site/src/routes/(play)/playground/code-group/`.

#### Demo App

- [x] **`demo/` showcase app** — Direction decided 2026-05-22: Koan (chat-shell + canvas) is the canonical demo. Original business-analytics spec (dashboard / data explorer / analytics / operations / notifications + curtain-reveal code drawer) is superseded. Shipped: Koan shell at `/app`, welcome page, Tabs response (C3), Theme Wizard response (C4), Dark + collapsed showcase (C5, `/app/tabs?mode=dark&collapsed=true`), layout + sub-routes architecture, conversation history sidebar, ThemePanel, catalog system. Future work tracked under the Koan catalog expansion item below.
- [x] **Koan catalog expansion** — Closed 2026-05-28 after audit. All 13 demos (theme-wizard / tabs / toasts / table / tree / multi-select / list / form / select / chart / combo / date-picker / stepper) have catalog meta + `/app/<demo>` route + matching `pickDemoKind` branch. Verified the three example chips ("Sortable data table" / "Tree select" / "Multi-select with chips") all resolve via runMatch to the correct demo id. Follow-up: `/app/catalog` route as a grid-browse entry (TBD per existing comment in `+layout.svelte`) — not blocking.
- [x] **Interactive theme wizard (D1–D3)** — Shipped 2026-05-27. The static C4 wizard card is now fully interactive: click swatch → set role.step, click palette card → toggle IN USE, real Save preset + Export tokens.css (writes localStorage + triggers download), clickable step nav across 01 Style / 02 Skin / 03 Typography / 04 Preview. Step 01 is a 5-card style picker that flips `vibe.style` live; step 04 renders Buttons / Input / Badges / Surface-stack tiles against the current theme. Step 03 ships as a typography sample placeholder — full font-family picking is its own design pass (font loading + system fallbacks).
- [x] **`apps/` restructure** — Shipped 2026-05-28. `site/` → `apps/learn/`, `demo/` → `apps/demo/`. Updated root `package.json` workspace globs (`./apps/learn`, `./apps/demo`) and `test:e2e` script, `vitest.config.ts` project roots + `$lib`/`$app` aliases + coverage exclude, both apps' `uno.config.js` content-include relatives (`../packages/` → `../../packages/`), `config/eslint.config.mjs` patterns, `config/bump.config.js`, and `CLAUDE.md` + `.claude/{commands,skills}/` + `agents/design-patterns.md` + `docs/design/{05,06}*.md` current-state references. Historical docs (journal, backlog/, superpowers/) intentionally not retroactively rewritten.

#### Theming & Design

- [x] **Minimal List guide-line style** — Shipped 2026-05-28. Continuous 1px paper-edge guide line via `[data-list]::before` on the container; active item gets `box-shadow: inset 2px 0 0 0 var(--accent)` overlapping the line at its row (no per-item border). Tree mirrors the pattern on `[data-tree-item-content][data-active="true"]` using `var(--primary)` — keeps the existing Connector indent lines.
- [x] **Consistent state patterns design doc** — Shipped 2026-05-28 at `docs/design/18-state-patterns.md`. Defines an 8-state vocabulary (transient: idle/hover/focus-visible/pressed; persistent: current/selected/disabled/read-only), three token tiers (surface / mark / affordance), the group-vs-element distinction (`:focus-within` + element state), a refactoring before/after for List, and a phased migration plan with a ~600-line reduction estimate. Migration itself is a follow-up.

### P1, P3, P4

All previously tracked items in these tiers are complete. See Archive.

---

## Archive

All previously tracked P1 (deleted-component restoration, conditional/multi-step forms, data table, layout components, density controls, whitelabeling, glass→frosted rename, StepIndicator theme CSS, frosted liquid-glass revamp), P3 (chart interactivity, zoom/pan, scatter/box/violin/bubble, ggplot aesthetic channels, CLI init/upgrade/skin/theme generators, curated icon sets), and P4 (component design docs, `06-themes.md`, `07-charts.md`, `08-tools.md`, `13-effects.md`, `14-density.md`, `15-i18n.md`, `16-whitelabeling.md`, `17-chart-preset.md`) items shipped before 2026-04-01.

For exact completion dates, commit hashes, and test counts, see `agents/journal.md` entries between 2026-02-27 and 2026-03-27. The full previous version of this checklist with inline `[x]` rows is preserved in git history at the commit prior to the 2026-05-20 restructure.
