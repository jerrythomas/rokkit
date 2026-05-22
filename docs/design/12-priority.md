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

- [ ] **CodeGroup site component** — tabbed multi-file code display with optional live preview (Svelte Snippet). Preview collapsed by default shows code-only. No per-panel theme switcher (app-wide instead). Lives at `site/src/lib/components/CodeGroup.svelte`.

#### Demo App

- [x] **`demo/` showcase app** — Direction decided 2026-05-22: Koan (chat-shell + canvas) is the canonical demo. Original business-analytics spec (dashboard / data explorer / analytics / operations / notifications + curtain-reveal code drawer) is superseded. Shipped: Koan shell at `/app`, welcome page, Tabs response (C3), Theme Wizard response (C4), Dark + collapsed showcase (C5, `/app/tabs?mode=dark&collapsed=true`), layout + sub-routes architecture, conversation history sidebar, ThemePanel, catalog system. Future work tracked under the Koan catalog expansion item below.
- [ ] **Koan catalog expansion** — add more demo responses to the catalog: table, tree, multi-select, list, combo, etc. Each becomes a `/app/<demo>` route with chat-left messages + canvas response card. Welcome chips that don't yet resolve (`Sortable data table`, `Tree select`, `Multi-select with chips`) currently fall back to Tabs — add the matching demos so they route correctly.
- [ ] **Interactive theme wizard (D1–D3)** — wire the static C4 wizard card to mutate theme state live: click swatch → set role.step, click palette card → toggle IN USE, step nav, real Save preset + Export tokens.css. The existing 4-step `demo/src/lib/koan/demos/theme-wizard/` flow has the persistence + apply primitives already.
- [ ] **`apps/` restructure** — move `site/` → `apps/learn/`, move `demo/` → `apps/demo/`; update vitest workspace paths, `bun.lock`, deploy config. Single structural commit. Now unblocked since the demo direction is decided.

#### Theming & Design

- [ ] **Minimal List guide-line style** — continuous thin vertical guide line on group container (like tree indent lines); active item gets a bolder/colored segment on that line; items indented so text aligns past the line (aligns with middle of parent icon). Applies to both List and Tree. Per-item left-borders are the wrong pattern for this aesthetic.
- [ ] **Consistent state patterns design doc** — shared CSS custom-property sets defining hover/active/focus/disabled behavior at element/group level. Reduces per-component repetition in theme CSS. Target: `docs/design/18-state-patterns.md`.

### P1, P3, P4

All previously tracked items in these tiers are complete. See Archive.

---

## Archive

All previously tracked P1 (deleted-component restoration, conditional/multi-step forms, data table, layout components, density controls, whitelabeling, glass→frosted rename, StepIndicator theme CSS, frosted liquid-glass revamp), P3 (chart interactivity, zoom/pan, scatter/box/violin/bubble, ggplot aesthetic channels, CLI init/upgrade/skin/theme generators, curated icon sets), and P4 (component design docs, `06-themes.md`, `07-charts.md`, `08-tools.md`, `13-effects.md`, `14-density.md`, `15-i18n.md`, `16-whitelabeling.md`, `17-chart-preset.md`) items shipped before 2026-04-01.

For exact completion dates, commit hashes, and test counts, see `agents/journal.md` entries between 2026-02-27 and 2026-03-27. The full previous version of this checklist with inline `[x]` rows is preserved in git history at the commit prior to the 2026-05-20 restructure.
