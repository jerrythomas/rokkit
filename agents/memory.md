# Project Memory

Shared project knowledge and confirmed decisions. Updated when decisions are made.
This file is read at the start of every session.

---

## Project Identity

**Rokkit** is a Svelte 5 component library and design system organized as a monorepo.

- **Runtime:** Bun
- **Language:** JavaScript/TypeScript (Svelte 5 with runes)
- **Key dependencies:** Svelte 5, UnoCSS, Vitest, Ramda (being phased out)

## Architecture

| Package | Purpose |
|---------|---------|
| `@rokkit/ui` | UI components (Select, Toggle, List, Tree, Menu, etc.) — depends on core, states, actions |
| `@rokkit/forms` | Schema-driven form rendering (FormBuilder, FormRenderer, Input types) |
| `@rokkit/themes` | CSS themes (base structural + rokkit/minimal/material/glass variants) |
| `@rokkit/core` | Constants, utilities, field mapping, icon collections |
| `@rokkit/states` | Reactive state classes (ListController, NestedController, ProxyItem, watchMedia) |
| `@rokkit/actions` | Svelte actions (keyboard, navigation, dismissable, etc.) |
| `@rokkit/icons` | SVG icon sets |
| `@rokkit/data` | Data structures (Dataset, hierarchy, parsing) |
| `@rokkit/chart` | Chart components |
| `sites/learn` | Documentation site + interactive demos + e2e tests |

## Project Principles

Immutable architectural rules. Checked during the PLAN phase.
Violations must be justified or the plan revised.

1. **Data-First** — Components adapt to data structures via field mapping, not the other way around.
2. **Composable** — Every component extensible via snippets without modification.
3. **Consistent API** — Standard props: `items`, `value` (bindable), `fields`, `onchange`/`onselect`.
4. **Accessible** — Keyboard navigation + ARIA via controller + navigator pattern.
5. **Themeable** — Unstyled components with data-attribute hooks, theme/layout CSS separation.

## Tooling & Stack

| Tool/Library | Version | Purpose | Docs |
|-------------|---------|---------|------|
| Svelte | ^5.0.0 | UI framework (runes mode) | svelte.dev |
| UnoCSS | latest | Atomic CSS + icon generation | unocss.dev |
| Vitest | latest | Unit testing | vitest.dev |
| Playwright | latest | E2E testing | playwright.dev |
| Bun | latest | Runtime + package manager | bun.sh |
| Ramda | latest | Data transforms (being phased out) | ramdajs.com |

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
| ItemProxy deleted, ProxyItem is canonical | All components migrated to ProxyItem from @rokkit/states; ItemProxy class removed | 2026-03 |
| Legacy Proxy deleted from @rokkit/states | Ramda-dependent Proxy class replaced by lightweight wrapper in deriveLookupWithProxy | 2026-03 |
| Migrated to simplified workflow | Adopted Story → Plan → Implement pipeline. Plans in docs/plans/, dropped open-questions/sessions. | 2026-03 |

## Technical Notes

- **State icons pattern**: Two-layer customization (global `defaultIcons` in core + per-instance `icons` prop). Naming: `{group}-{state}` (e.g., `node-opened`, `checkbox-checked`)
- **FormBuilder type resolution**: string+options→select, boolean→checkbox, number+min+max→range, readonly→info, no scope→separator
- **Theme structure**: `base/` (structural layout), `rokkit/` (colors/effects), `minimal/`, `material/`, `glass/` — each has per-component CSS files imported via `index.css`
- **Playground pattern**: Each page uses `Playground` wrapper with `preview` and `controls` snippets. Toggle page is the pilot for FormRenderer-based controls.

## Current Status

- Tests: 2536 passing (179 files)
- Lint: 0 errors (pre-existing warnings only)
- Phase: ProxyItem migration complete. All components use ProxyItem + ProxyTree + Wrapper stack. Ready for new features (Upload, Table phases, etc.)
