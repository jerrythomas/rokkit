# Priority Checklist

A working checklist of all pending work items collected from feature status tables and planned design documents. Organized by priority tier. Check off items as they are completed.

Last updated: 2026-03-17 (P4 design docs + story pages written)

---

## P1 — High Impact, Core Functionality

Items that block other work or are essential for the library to be complete.

### Restore Deleted Components

These components existed and were deleted in commit `4ef37ef4` (2026-02-18). Source and tests survive in git history. Placeholder stories exist in `site/src/stories/`.

- [ ] **StatusList** (`@rokkit/ui`) — list of status checks (pass/fail/warn/unknown) with icons, used for multi-rule validation like password strength. Source at `git show 6275d11d:packages/ui/src/ValidationReport.svelte` (old name — rename to StatusList). Story placeholder: `site/src/stories/validation-report/`. Needs theme CSS in `@rokkit/themes`.
- [ ] **Message/Alert** (`@rokkit/ui`) — single alert/notification with `type` (error/info/success/warning) and text or snippet children. Source at `git show 6275d11d:packages/ui/src/Message.svelte`. Needs associated `alerts` store in `@rokkit/states` for programmatic notification pushing (toast-style). No placeholder story exists — needs creating.

### Forms

- [x] Conditional fields — `showWhen` on layout elements, `equals`/`notEquals` operators, `getVisibleData()` on submit (`docs/features/05-Forms.md`)
- [ ] Multi-step forms — sequential steps with per-step validation and step indicator (`docs/features/05-Forms.md`)

### Component Library

- [x] Rename `text` field to `label` in all component defaults and remove backward compatibility layer (code change)
- [ ] Cards — complete in-progress implementation: interactive states, snippet support, theming (`docs/features/06-ComponentLibrary.md`)
- [ ] Navigation: Breadcrumb — path display component with navigable links (`docs/features/06-ComponentLibrary.md`)
- [ ] Layout components — Stack, Grid, Divider with responsive behavior (`docs/features/06-ComponentLibrary.md`)
- [ ] Data Table — tabular data display with sorting, selection, and keyboard navigation (`docs/features/06-ComponentLibrary.md`)

### Theming & Design

- [ ] Data-density controls — compact / default / comfortable density modes inherited from context (`docs/features/03-ThemingAndDesign.md`)
- [ ] Whitelabeling — full replacement of all visual defaults via skin + typography + icon + shape tokens (`docs/features/03-ThemingAndDesign.md`)

---

## P2 — User Experience Enhancements

Items that significantly improve the developer or end-user experience.

### Accessibility & Internationalization

- [ ] Tooltips — hover and focus triggered, keyboard accessible, linked via aria-describedby (`docs/features/04-AccessibilityAndI18n.md`)
- [ ] Internationalization (i18n) — translatable built-in strings, locale-aware number/date formatting, RTL layout support (`docs/features/04-AccessibilityAndI18n.md`)

### Developer Utilities

- [ ] Custom component primitives — documented patterns and examples for building components on top of controllers, navigator, and ProxyItem (`docs/features/08-DeveloperUtilities.md`)

### Charts — Core Functionality

- [ ] Sparkline pattern fills — pattern fill alternative for color-insufficient contexts (`docs/features/07-Charts.md`)
- [ ] Animated bar chart — animated entry and data transition (`docs/features/07-Charts.md`)
- [ ] Animated line / area chart — line draw animation and smooth data transitions (`docs/features/07-Charts.md`)
- [ ] Pie / donut chart — proportional segment chart with optional center label (`docs/features/07-Charts.md`)
- [ ] Theme color palette integration — charts draw series colors from active theme skin (`docs/features/07-Charts.md`)
- [ ] Dark mode support for charts — background, gridlines, labels, and series adapt to dark mode (`docs/features/07-Charts.md`)
- [ ] Accessible data table fallback — visually hidden data table in DOM for screen reader access (`docs/features/07-Charts.md`)

---

## P3 — Advanced Features

Items that add sophisticated capabilities.

### Charts — Advanced Interaction

- [ ] Interactive tooltips — value and label tooltip on hover over data points and bars (`docs/features/07-Charts.md`)
- [ ] Click selection on data points — selection event fires with point data on click (`docs/features/07-Charts.md`)
- [ ] Keyboard navigation within charts — focus moves between data points, values announced to screen readers (`docs/features/07-Charts.md`)
- [ ] Scatter chart — x/y correlation plot with optional size and color encoding (`docs/features/07-Charts.md`)
- [ ] Pattern fills for series — stripe, dot, and hatch patterns for multi-series differentiation (`docs/features/07-Charts.md`)
- [ ] Zoom and pan — scrollable and draggable chart viewport for large data ranges (`docs/features/07-Charts.md`)

### Toolchain

- [ ] CLI: add Rokkit to a project — installs packages, configures build, imports starter theme (`docs/features/09-Toolchain.md`)
- [ ] CLI: upgrade Rokkit — updates packages, applies migration steps, reports breaking changes (`docs/features/09-Toolchain.md`)
- [ ] Curated icon sets — navigation, status, action, and object icons with tree-shaking (`docs/features/09-Toolchain.md`)
- [ ] Tree-shaken icon imports — only imported icons included in the bundle (`docs/features/09-Toolchain.md`)
- [ ] Custom icon override (global snippet) — replace all component icons with any icon system via one registration point (`docs/features/09-Toolchain.md`)
- [ ] CLI: generate custom skin — scaffold with all semantic color token slots and role annotations (`docs/features/09-Toolchain.md`)
- [ ] CLI: generate custom theme scaffold — CSS file with selectors for every component, pre-wired token references (`docs/features/09-Toolchain.md`)

---

## P4 — Documentation and Design

Design documents that need to be written and patterns that need to be documented.

### Core Design Documents (planned, not yet written)

- [x] `docs/design/13-effects.md` — Animation and visual effects system
- [ ] `docs/design/06-themes.md` — Skin system, mode switching, CSS variable architecture
- [ ] `docs/design/07-charts.md` — Chart rendering, animation, patterns, accessibility
- [ ] `docs/design/08-tools.md` — CLI, icon sets, toolchain design

### Placeholder Story Pages (ComingSoon — need real content)

These pages exist at `site/src/stories/` but show `<ComingSoon />`:

- [x] `validation-report` — uses `StatusList` from `@rokkit/forms` (UI package restore still P1)
- [x] `inputfield` — InputField, Input, InfoField from `@rokkit/forms`
- [ ] `responsive-grid` — Layout/Grid component story (blocked on P1 Grid component)
- [x] `forms/overview` — forms system intro and quick-start
- [x] `forms/layout` — layout options (columns, sections, groups)
- [x] `forms/schema` — schema-driven form generation
- [x] `forms/advanced` — conditional fields, lookups, array editors
- [x] `forms/validation` — validation rules, StatusList integration
- [x] `templates/editor` — editor template story (Tree + FormRenderer composition pattern)

### Component Design Documents (planned or missing)

- [x] Card component design — `docs/design/components/card.md`
- [ ] Layout components design (Stack, Grid, Divider) — structural components, responsive behavior, CSS architecture
- [x] Data Table design — `docs/design/components/data-table.md`
- [x] Breadcrumb design — `docs/design/components/breadcrumbs.md`
- [x] Tooltip design — `docs/design/components/tooltip.md`
- [x] Conditional fields design — covered in `docs/design/components/multi-step-form.md` and forms feature doc
- [x] Multi-step form design — `docs/design/components/multi-step-form.md`
- [x] i18n design — `docs/design/15-i18n.md`
- [x] Density system design — `docs/design/14-density.md`
- [x] Whitelabeling guide — `docs/design/16-whitelabeling.md`
