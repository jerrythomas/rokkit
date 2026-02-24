# Project Memory

Shared project knowledge and confirmed decisions. Updated when decisions are made.
This file is read at the start of every session.

---

## Project Identity

**Rokkit** is a Svelte 5 component library and design system organized as a monorepo.

- **Runtime:** Bun
- **Language:** JavaScript/TypeScript (Svelte 5 with runes)
- **Key dependencies:** Svelte 5, UnoCSS, Vitest, Ramda
- **Test runner:** `bun run test:ci` (Vitest, 1057 tests as of 2026-02-19)

## Architecture

| Package | Purpose |
|---------|---------|
| `@rokkit/ui` | UI components (Select, Toggle, List, Tree, Menu, etc.) — depends on core, states, actions |
| `@rokkit/forms` | Schema-driven form rendering (FormBuilder, FormRenderer, Input types) |
| `@rokkit/themes` | CSS themes (base structural + rokkit/minimal/material variants) |
| `@rokkit/core` | Constants, utilities, field mapping, icon collections |
| `@rokkit/states` | Reactive state classes (Proxy, ListController, NestedController) |
| `@rokkit/actions` | Svelte actions (keyboard, navigation, dismissable, etc.) |
| `@rokkit/icons` | SVG icon sets |
| `@rokkit/data` | Data structures (Dataset, hierarchy, parsing) |
| `@rokkit/chart` | Chart components |
| `sites/playground` | Interactive component demos |
| `sites/learn` | Documentation site |

## Key Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Icons as CSS classes (`<span class={icon}>`) | UnoCSS generates icon classes; no Icon component needed | 2026-02 |
| Data attributes for CSS selectors (`data-*`) | Decouples theme from implementation, enables theme layering | 2026-02 |
| Gradient border via bg wrapper | CSS doesn't support gradient borders natively; `[data-input-root]` uses `bg-gradient p-px` + inner bg | 2026-02 |
| InputSelect wraps @rokkit/ui Select | Replaces native `<select>` with themed component; normalizes string arrays to {text,value} | 2026-02 |
| InputCheckbox defaults to 'custom' variant | Uses icon-based checkbox from @rokkit/core defaultStateIcons instead of native | 2026-02 |
| FormBuilder element.type at top level | FormRenderer checks element.type for separator/info routing | 2026-02 |
| @rokkit/types package deferred | ui types (TS) and core types (JSDoc) serve different purposes | 2026-02 |
| ItemProxy stays in @rokkit/ui | Different abstraction layer from @rokkit/states; prevents dependency chain | 2026-02 |

## Technical Notes

- **State icons pattern**: Two-layer customization (global `defaultIcons` in core + per-instance `icons` prop). Naming: `{group}-{state}` (e.g., `node-opened`, `checkbox-checked`)
- **FormBuilder type resolution**: string+options→select, boolean→checkbox, number+min+max→range, readonly→info, no scope→separator
- **Theme structure**: `base/` (structural layout), `rokkit/` (colors/effects), `minimal/`, `material/` — each has per-component CSS files imported via `index.css`
- **Playground pattern**: Each page uses `Playground` wrapper with `preview` and `controls` snippets. Toggle page is the pilot for FormRenderer-based controls.

## Current Status

- Tests: 1057 passing
- Lint: 0 errors
- Phase: Forms Phase 1 & 2 complete. Now fixing issues from docs/issues/001.md (bugs, styles, icons).
