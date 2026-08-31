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

| Package           | Purpose                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `@rokkit/ui`      | UI components (Select, Toggle, List, Tree, Menu, etc.) — depends on core, states, actions |
| `@rokkit/forms`   | Schema-driven form rendering (FormBuilder, FormRenderer, Input types)                     |
| `@rokkit/themes`  | CSS themes (base structural + rokkit/minimal/material/frosted/zen-sumi variants)          |
| `@rokkit/core`    | Constants, utilities, field mapping, icon collections                                     |
| `@rokkit/states`  | Reactive state classes (Wrapper, LazyWrapper, ProxyItem, ProxyTree, ProxyTable, vibe, watchMedia) |
| `@rokkit/actions` | Svelte actions (keyboard, navigation, dismissable, etc.)                                  |
| `@rokkit/icons`   | SVG icon sets                                                                             |
| `@rokkit/data`    | Data structures (Dataset, hierarchy, parsing)                                             |
| `@rokkit/chart`   | Chart components                                                                          |
| `site`            | Documentation site + interactive demos + e2e tests                                        |

## Project Principles

Immutable architectural rules. Checked during the PLAN phase.
Violations must be justified or the plan revised.

1. **Data-First** — Components adapt to data structures via field mapping, not the other way around.
2. **Composable** — Every component extensible via snippets without modification.
3. **Consistent API** — Standard props: `items`, `value` (bindable), `fields`, `onchange`/`onselect`.
4. **Accessible** — Keyboard navigation + ARIA via controller + navigator pattern.
5. **Themeable** — Unstyled components with data-attribute hooks, theme/layout CSS separation.

## Tooling & Stack

| Tool/Library | Version | Purpose                            | Docs           |
| ------------ | ------- | ---------------------------------- | -------------- |
| Svelte       | ^5.0.0  | UI framework (runes mode)          | svelte.dev     |
| UnoCSS       | latest  | Atomic CSS + icon generation       | unocss.dev     |
| Vitest       | latest  | Unit testing                       | vitest.dev     |
| Playwright   | latest  | E2E testing                        | playwright.dev |
| Bun          | latest  | Runtime + package manager          | bun.sh         |
| Ramda        | latest  | Data transforms (being phased out) | ramdajs.com    |

## Key Decisions

| Decision                                     | Rationale                                                                                             | Date    |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------- |
| Icons as CSS classes (`<span class={icon}>`) | UnoCSS generates icon classes; no Icon component needed                                               | 2026-02 |
| Data attributes for CSS selectors (`data-*`) | Decouples theme from implementation, enables theme layering                                           | 2026-02 |
| Gradient border via bg wrapper               | CSS doesn't support gradient borders natively; `[data-input-root]` uses `bg-gradient p-px` + inner bg | 2026-02 |
| InputSelect wraps @rokkit/ui Select          | Replaces native `<select>` with themed component; normalizes string arrays to {text,value}            | 2026-02 |
| InputCheckbox defaults to 'custom' variant   | Uses icon-based checkbox from @rokkit/core defaultStateIcons instead of native                        | 2026-02 |
| FormBuilder element.type at top level        | FormRenderer checks element.type for separator/info routing                                           | 2026-02 |
| @rokkit/types package deferred               | ui types (TS) and core types (JSDoc) serve different purposes                                         | 2026-02 |
| ItemProxy deleted, ProxyItem is canonical    | All components migrated to ProxyItem from @rokkit/states; ItemProxy class removed                     | 2026-03 |
| Legacy Proxy deleted from @rokkit/states     | Ramda-dependent Proxy class replaced by lightweight wrapper in deriveLookupWithProxy                  | 2026-03 |
| Migrated to simplified workflow              | Adopted Story → Plan → Implement pipeline. Plans in docs/plans/, dropped open-questions/sessions.     | 2026-03 |

## Key Architectural Decisions

**ADR-001: Component Architecture Strategy (2026-01-31)** — Prioritize `@rokkit/ui` custom components over `@rokkit/bits-ui` wrappers. Standardize on `options` (not `items`) for data props. Remove the deprecated `using` prop in favor of snippets. bits-ui retained only as a base for complex a11y patterns (Dialog, Popover, Combobox, DropdownMenu); all others built custom.

**ADR-002: Rename @rokkit/bits-ui to @rokkit/composables (2026-01-31)** — Renamed package to better describe its composable-primitive nature and hide the bits-ui implementation detail. `@rokkit/ui` stays data-driven (single component, `options` prop); `@rokkit/composables` holds compound component primitives (e.g. `Tree.Root`, `Tree.Node`). Partially superseded by ADR-003.

**ADR-003: MVC Separation — Fold Composables, Adopt Actions/States in UI (2026-02-20, FULLY COMPLETE)** — Removed `@rokkit/composables` entirely (and bits-ui with it). Added `@rokkit/states` and `@rokkit/actions` as dependencies of `@rokkit/ui`. Migrated List, Tree, Menu, Select, MultiSelect, Toggle to the shared `Wrapper`/`LazyWrapper` state controllers (over `ProxyTree`) + the `Navigator` keyboard class instead of per-component inline logic, eliminating ~1200 lines of duplication. Proxy/ItemProxy unification deferred (different abstractions).

## Technical Notes

- **State icons pattern**: Two-layer customization (global `defaultIcons` in core + per-instance `icons` prop). Naming: `{group}-{state}` (e.g., `node-opened`, `checkbox-checked`)
- **FormBuilder type resolution**: string+options→select, boolean→checkbox, number+min+max→range, readonly→info, no scope→separator
- **Theme structure**: `base/` (structural layout), `rokkit/` (colors/effects), `minimal/`, `material/`, `frosted/`, `zen-sumi/` — each has per-component CSS files imported via `index.css`
- **Playground pattern**: Each page uses `Playground` wrapper with `preview` and `controls` snippets. Toggle page is the pilot for FormRenderer-based controls.

## Contrast & State Gates

Three gates, and they see different things — a change usually has to satisfy all three:

| Gate | Fixture | Asserts | Tolerance |
| --- | --- | --- | --- |
| `theme-contrast.e2e.ts` | `/embed/gallery` | WCAG contrast **at rest** | ratchet (3 baselined) |
| `interaction-contrast.e2e.ts` | `/embed/gallery` | WCAG contrast under **hover / focus / focus-visible / active / focus-hover**, for text (4.5), icons (3.0) and SVG chart marks (3.0) | ratchet (58 baselined) |
| `state-snapshot.e2e.ts` | `/embed/states` | exact computed styles for List states | exact match |

Rules that fall out of this, learned the hard way:

- **`ink-soft` is the placeholder tone** (ink.500 — 1.95–2.13:1 on paper). It cannot carry an
  interactive control's label or icon. `ink-mute` is the readable-secondary token.
- **On a `paper-mute` fill the text is `ink`, never `ink-mute`** — that pairing is 4.07:1 in
  dark mode. It passes at rest only because resting items sit on `paper`.
- **A hover rule out-specifies a `[data-selected]` rule** ((0,5,0) vs (0,3,0)) unless the
  selected state is restated with the pseudo-class. This applies again one level deeper for
  the item's icon ((0,5,0) vs (0,4,0)).
- **A filled element's label takes the fill's on-color.** Only `on-primary` is a real CSS
  variable; `text-on-accent`/`text-on-danger` compile to a **build-time-baked hex** and cannot
  react to a skin.
- **Hover must move a fill AWAY from its label**, and the safe direction depends on which side
  of the y=0.19 crossover the fill sits. Use `oklch(from … calc(l + (l - 0.566) * 0.3) …)`;
  never a fixed darken or lighten.
- **Translucent tints are not solid fills** — the on-color picked for the solid 500 is the
  wrong reference for `bg-primary/35`. Use `ink`.
- **The on-color dead zone:** a fill with relative luminance in (0.1735, 0.2111) clears 4.5:1
  against neither near-black nor near-white. `violet-500` and `indigo-500` are the only two
  built-in palettes in it.
- Freeze transitions before measuring a state, or you read the idle colour at t=0.

## Current Status

- Tests: 5798 passing (384 files)
- Lint: **0 errors, 0 warnings** — enforced by `--max-warnings 0` in the root
  `lint` script, so any new warning fails the build
- Phase: ProxyItem migration complete. All components use ProxyItem + ProxyTree + Wrapper stack. Ready for new features (Upload, Table phases, etc.)
