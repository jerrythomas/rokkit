# Priority Checklist

A working checklist of all pending work items collected from feature status tables and planned design documents. Organized by priority tier. Check off items as they are completed.

Last updated: 2026-03-26 (Stack, Divider, Avatar, Badge implemented; chart preset fully implemented including CLI init/doctor and site config)

---

## P1 — High Impact, Core Functionality

Items that block other work or are essential for the library to be complete.

### Restore Deleted Components

These components existed and were deleted in commit `4ef37ef4` (2026-02-18). Source and tests survive in git history. Placeholder stories exist in `site/src/stories/`.

- [x] **StatusList** (`@rokkit/ui`) — list of status checks (pass/fail/warn/unknown) with icons, used for multi-rule validation like password strength. Theme CSS, playground, docs, and e2e tests complete (2026-03-18).
- [x] **Message/Alert** (`@rokkit/ui`) — single alert/notification with `type` (error/info/success/warning) and text or snippet children, plus `AlertList` toast system using `@rokkit/states` alerts store. Playground, docs, and e2e tests complete (2026-03-18).

### Forms

- [x] Conditional fields — `showWhen` on layout elements, `equals`/`notEquals` operators, `getVisibleData()` on submit (`docs/features/05-Forms.md`)
- [ ] Multi-step forms — sequential steps with per-step validation and step indicator (`docs/features/05-Forms.md`)

### Component Library

- [x] Rename `text` field to `label` in all component defaults and remove backward compatibility layer (code change)
- [x] Cards — implemented (`packages/ui/src/components/Card.svelte`)
- [x] Navigation: Breadcrumb — implemented (`packages/ui/src/components/BreadCrumbs.svelte`)
- [x] Layout components — Stack, Divider, Grid all implemented; Avatar and Badge also added (2026-03-26)
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
- [x] Pie / donut chart — `PieChart` with `innerRadius` prop for donut; `labelFn`, `stat`, `fill`, `pattern` (2026-03-23)
- [x] Chart preset — `createChartPreset()` + default preset; shade-mapping replaces hardcoded hex in `brewing/palette.json`; `ChartProvider` Svelte context; opacity to preset; jitter on Point (`docs/design/17-chart-preset.md`) (2026-03-26)
  - [x] Step 1: `createChartPreset()` + `defaultPreset` in `packages/chart/src/lib/preset.js`
  - [x] Step 2: Delete `brewing/palette.json`; rewrite `assignColors()` with shade-index mapping into `lib/palette.json`
  - [x] Step 3: Remove hardcoded opacity from `Area.svelte`, `Box.svelte`, `Violin.svelte`; read from preset
  - [x] Step 4: `ChartProvider.svelte` + `PlotState` reads preset from `'chart-preset'` context
  - [x] Step 5: Jitter on `Point` / `ScatterPlot` — seeded LCG offset, `jitter.width`/`jitter.height` props
  - [x] Step 6: `rokkit init` optional chart config step
- [ ] Dark mode support for charts — background, gridlines, labels, and series adapt to dark mode (`docs/features/07-Charts.md`)
- [ ] Accessible data table fallback — visually hidden data table in DOM for screen reader access (`docs/features/07-Charts.md`)
- [x] BoxPlot — quartile aggregation via `@rokkit/data`, `fill` (body) + `color` (whiskers) aesthetics (2026-03-23)
- [x] ViolinPlot — density shape via quartile anchors + catmullRom curve, `fill` + `color` aesthetics (2026-03-23)
- [x] BubbleChart — scatter with `size` channel, `color` aesthetic, sizeScale sqrt encoding (2026-03-23)
- [x] ggplot2-style aesthetic channels — `fill` for polygons, `color` for strokes/lines, all channels null-default independent (2026-03-23)
- [x] Horizontal BarChart — auto-detected: swap x/y so y=categorical, x=numeric; `Bar.svelte` + `PlotState` handle orientation (issue #108)
- [x] Stacked / grouped BarChart — `stack=true` for stacked; grouped bars are automatic when `fill` maps to a multi-value field (`buildGroupedBars` is the default path) (issue #109)
- [ ] Static color literal support — `fill`/`color` accepts CSS color values directly without groupBy (issue #110)

---

## P3 — Advanced Features

Items that add sophisticated capabilities.

### Charts — Advanced Interaction

- [ ] Interactive tooltips — value and label tooltip on hover over data points and bars (`docs/features/07-Charts.md`)
- [ ] Click selection on data points — selection event fires with point data on click (`docs/features/07-Charts.md`)
- [ ] Keyboard navigation within charts — focus moves between data points, values announced to screen readers (`docs/features/07-Charts.md`)
- [x] Scatter chart — `ScatterPlot` with `size`, `fill`, `color`, `symbol`, `label` channels (2026-03-23)
- [ ] Pattern fills for series — stripe, dot, and hatch patterns for multi-series differentiation (`docs/features/07-Charts.md`)
- [ ] Zoom and pan — scrollable and draggable chart viewport for large data ranges (`docs/features/07-Charts.md`)

### Toolchain

- [x] CLI: add Rokkit to a project — `rokkit init` prompts for palette, icons, themes, switcher; writes `rokkit.config.js`, `uno.config.js`, patches `app.css` and `app.html` (already done)
- [x] CLI: upgrade Rokkit — `rokkit upgrade` detects @rokkit/\* deps, fetches latest versions, prints diff, detects package manager, runs install with `--apply` (2026-03-18)
- [ ] Curated icon sets — navigation, status, action, and object icons with tree-shaking (`docs/features/09-Toolchain.md`)
- [ ] Tree-shaken icon imports — only imported icons included in the bundle (`docs/features/09-Toolchain.md`)
- [ ] Custom icon override (global snippet) — replace all component icons with any icon system via one registration point (`docs/features/09-Toolchain.md`)
- [x] CLI: generate custom skin — `rokkit skin create --name` scaffolds skin entry with all 9 color token keys in rokkit.config.js (2026-03-18)
- [x] CLI: generate custom theme scaffold — `rokkit theme create --name` generates CSS stub with all 25 component selectors in src/themes/ (2026-03-18)

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
- [~] Layout components design (Stack, Grid, Divider) — components implemented; formal design doc still missing
- [x] Data Table design — `docs/design/components/data-table.md`
- [x] Breadcrumb design — `docs/design/components/breadcrumbs.md`
- [x] Tooltip design — `docs/design/components/tooltip.md`
- [x] Conditional fields design — covered in `docs/design/components/multi-step-form.md` and forms feature doc
- [x] Multi-step form design — `docs/design/components/multi-step-form.md`
- [x] i18n design — `docs/design/15-i18n.md`
- [x] Density system design — `docs/design/14-density.md`
- [x] Whitelabeling guide — `docs/design/16-whitelabeling.md`
