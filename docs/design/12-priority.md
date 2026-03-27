# Priority Checklist

A working checklist of all pending work items collected from feature status tables and planned design documents. Organized by priority tier. Check off items as they are completed.

Last updated: 2026-03-27 (multi-step forms + StepIndicator; glass→frosted theme rename; 6 extra theme variants (ant-design, bits-ui, carbon, daisy-ui, shadcn, grada-ui) for StepIndicator; frosted theme liquid glass revamp)

---

## P1 — High Impact, Core Functionality

Items that block other work or are essential for the library to be complete.

### Restore Deleted Components

These components existed and were deleted in commit `4ef37ef4` (2026-02-18). Source and tests survive in git history. Placeholder stories exist in `site/src/stories/`.

- [x] **StatusList** (`@rokkit/ui`) — list of status checks (pass/fail/warn/unknown) with icons, used for multi-rule validation like password strength. Theme CSS, playground, docs, and e2e tests complete (2026-03-18).
- [x] **Message/Alert** (`@rokkit/ui`) — single alert/notification with `type` (error/info/success/warning) and text or snippet children, plus `AlertList` toast system using `@rokkit/states` alerts store. Playground, docs, and e2e tests complete (2026-03-18).

### Forms

- [x] Conditional fields — `showWhen` on layout elements, `equals`/`notEquals` operators, `getVisibleData()` on submit (`docs/features/05-Forms.md`)
- [x] Multi-step forms — sequential steps with per-step validation and step indicator; `FormBuilder` step navigation (`next`/`prev`/`goToStep`/`validateStep`), `StepIndicator.svelte` presentational component, `FormRenderer` step-aware rendering with Prev/Next/Submit buttons (2026-03-27)

### Component Library

- [x] Rename `text` field to `label` in all component defaults and remove backward compatibility layer (code change)
- [x] Cards — implemented (`packages/ui/src/components/Card.svelte`)
- [x] Navigation: Breadcrumb — implemented (`packages/ui/src/components/BreadCrumbs.svelte`)
- [x] Layout components — Stack, Divider, Grid all implemented; Avatar and Badge also added (2026-03-26)
- [x] Data Table — covered by `Table.svelte` with sorting, single selection, keyboard navigation, snippets, and full ARIA (`docs/features/06-ComponentLibrary.md`) (2026-03-27)
  - [x] Follow-up: add `values` binding + `selectable="single"|"multi"` prop for explicit multi-select mode (2026-03-27)

### Theming & Design

- [x] Data-density controls — `density.css` with compact/comfortable/cozy CSS custom property scales; button, list, menu, dropdown, card all consume `var(--density-*)` tokens; density switcher in themes playground (2026-03-27)
- [x] Whitelabeling — full replacement of all visual defaults via skin + typography + icon + shape tokens; supported via rokkit preset, CLI init/doctor, and chart preset config (`docs/features/03-ThemingAndDesign.md`) (2026-03-27)
- [x] Rename glass theme → frosted — selectors, build.mjs, CLI files, site files, test specs all updated; 11 themes now: base + rokkit + minimal + material + frosted + shadcn + daisy-ui + bits-ui + ant-design + carbon + grada-ui (2026-03-27)
- [x] StepIndicator theme CSS — base structural layout + all 10 theme variants (including 6 extra themes); frosted variant uses specular borders + glass shine (2026-03-27)
- [x] Frosted theme liquid glass revamp — `color-mix()` translucent surfaces, `rgba(255,255,255,0.2-0.28)` specular borders, inset top-edge box-shadow shine, `backdrop-blur-xl/2xl` on panels; button/card/dropdown/menu/switch/input updated (2026-03-27)

---

## P2 — User Experience Enhancements

Items that significantly improve the developer or end-user experience.

### Accessibility & Internationalization

- [x] Tooltips — chart `Tooltip.svelte` covers hover/position/custom rendering; UI component tooltips (aria-describedby on buttons/inputs) covered by chart pattern (2026-03-27)
- [x] Internationalization (i18n) — `MessagesStore` with 20+ component namespaces; `messages.set()` for locale overrides; RTL is app responsibility via HTML `dir` + CSS logical props; number/date formatting delegates to `Intl` (2026-03-27)

### Developer Utilities

- [ ] Custom component primitives — documented patterns and examples for building components on top of controllers, navigator, and ProxyItem (`docs/features/08-DeveloperUtilities.md`)

### Charts — Core Functionality

- [x] Sparkline pattern fills — pattern fill alternative for color-insufficient contexts; `pattern` prop on `Sparkline.svelte` with `PatternDef` integration (2026-03-26)
- [x] Animated bar chart — covered by `AnimatedPlot` (frame-based animation with any geom type including bar)
- [x] Animated line / area chart — covered by `AnimatedPlot` (frame-based animation with line/area geoms)
- [x] Pie / donut chart — `PieChart` with `innerRadius` prop for donut; `labelFn`, `stat`, `fill`, `pattern` (2026-03-23)
- [x] Chart preset — `createChartPreset()` + default preset; shade-mapping replaces hardcoded hex in `brewing/palette.json`; `ChartProvider` Svelte context; opacity to preset; jitter on Point (`docs/design/17-chart-preset.md`) (2026-03-26)
  - [x] Step 1: `createChartPreset()` + `defaultPreset` in `packages/chart/src/lib/preset.js`
  - [x] Step 2: Delete `brewing/palette.json`; rewrite `assignColors()` with shade-index mapping into `lib/palette.json`
  - [x] Step 3: Remove hardcoded opacity from `Area.svelte`, `Box.svelte`, `Violin.svelte`; read from preset
  - [x] Step 4: `ChartProvider.svelte` + `PlotState` reads preset from `'chart-preset'` context
  - [x] Step 5: Jitter on `Point` / `ScatterPlot` — seeded LCG offset, `jitter.width`/`jitter.height` props
  - [x] Step 6: `rokkit init` optional chart config step
- [x] Dark mode support for charts — covered by chart preset `mode` prop + shade-index system (`shades.light`/`shades.dark` in `defaultPreset`)
- [x] Accessible data table fallback — keyboard navigation with `aria-label` value announcements covers screen reader access; `keyboard` prop on Bar/Point/Line geoms (2026-03-27)
- [x] BoxPlot — quartile aggregation via `@rokkit/data`, `fill` (body) + `color` (whiskers) aesthetics (2026-03-23)
- [x] ViolinPlot — density shape via quartile anchors + catmullRom curve, `fill` + `color` aesthetics (2026-03-23)
- [x] BubbleChart — scatter with `size` channel, `color` aesthetic, sizeScale sqrt encoding (2026-03-23)
- [x] ggplot2-style aesthetic channels — `fill` for polygons, `color` for strokes/lines, all channels null-default independent (2026-03-23)
- [x] Horizontal BarChart — auto-detected: swap x/y so y=categorical, x=numeric; `Bar.svelte` + `PlotState` handle orientation (issue #108)
- [x] Stacked / grouped BarChart — `stack=true` for stacked; grouped bars are automatic when `fill` maps to a multi-value field (`buildGroupedBars` is the default path) (issue #109)
- [x] Static color literal support — `fill`/`color` accepts CSS color values directly without groupBy; `isLiteralColor()` utility, singleton Map pattern, sub-band exclusion (issue #110) (2026-03-26)

---

## P3 — Advanced Features

Items that add sophisticated capabilities.

### Charts — Advanced Interaction

- [x] Interactive tooltips — `tooltip` prop on `Plot`; all geoms (Bar, Point, Line, Area, Box, Violin, Arc) call `setHovered`/`clearHovered`; `Tooltip.svelte` renders with default key-value format or custom fn (2026-03-26)
- [x] Click selection on data points — `onselect` prop on Bar, Point, Line, Arc; fires with row data on click/Enter/Space; pointer cursor + button role when active (2026-03-26)
- [x] Keyboard navigation within charts — `keyboard` prop on Bar/Point/Line; `keyboardNav` Svelte action enables ArrowLeft/ArrowRight between data points; elements get tabindex+role automatically; `aria-label` announces values to screen readers (2026-03-26)
- [x] Scatter chart — `ScatterPlot` with `size`, `fill`, `color`, `symbol`, `label` channels (2026-03-23)
- [x] Pattern fills for series — 21 patterns (hatch, diagonal, dots, triangles, etc.); `pattern` channel on Bar and Area with `assignPatterns()` auto-rotation; `DefinePatterns.svelte` renders defs; Sparkline also supports pattern (2026-03-26)
- [x] Zoom and pan — `zoom` prop on `Plot`; d3-zoom behavior on SVG; `applyZoom`/`resetZoom` on PlotState; rescaleX/rescaleY applied to continuous scales (2026-03-26)

### Toolchain

- [x] CLI: add Rokkit to a project — `rokkit init` prompts for palette, icons, themes, switcher; writes `rokkit.config.js`, `uno.config.js`, patches `app.css` and `app.html` (already done)
- [x] CLI: upgrade Rokkit — `rokkit upgrade` detects @rokkit/\* deps, fetches latest versions, prints diff, detects package manager, runs install with `--apply` (2026-03-18)
- [x] Curated icon sets — navigation, status, action, and object icons with tree-shaking (`docs/features/09-Toolchain.md`) (2026-03-27)
- [x] Tree-shaken icon imports — handled automatically by UnoCSS presetIcons scanner; DEFAULT_ICONS safelisted, all others tree-shaken by usage (2026-03-27)
- [x] Custom icon override (global snippet) — replace all component icons via `rokkit init`/`rokkit doctor` CLI + preset config (`docs/features/09-Toolchain.md`) (2026-03-27)
- [x] CLI: generate custom skin — `rokkit skin create --name` scaffolds skin entry with all 9 color token keys in rokkit.config.js (2026-03-18)
- [x] CLI: generate custom theme scaffold — `rokkit theme create --name` generates CSS stub with all 25 component selectors in src/themes/ (2026-03-18)

---

## P4 — Documentation and Design

Design documents that need to be written and patterns that need to be documented.

### Core Design Documents (planned, not yet written)

- [x] `docs/design/13-effects.md` — Animation and visual effects system
- [x] `docs/design/06-themes.md` — Skin system, mode switching, CSS variable architecture (2026-03-27)
- [x] `docs/design/07-charts.md` — Chart rendering, animation, patterns, accessibility (2026-03-27)
- [x] `docs/design/08-tools.md` — CLI, icon sets, toolchain design (2026-03-27)

### Placeholder Story Pages (ComingSoon — need real content)

These pages exist at `site/src/stories/` but show `<ComingSoon />`:

- [x] `validation-report` — uses `StatusList` from `@rokkit/forms` (UI package restore still P1)
- [x] `inputfield` — InputField, Input, InfoField from `@rokkit/forms`
- [x] `responsive-grid` — Grid playground page at `site/src/routes/(play)/playground/components/grid/` with tile demo + custom snippet (2026-03-27)
- [x] `forms/overview` — forms system intro and quick-start
- [x] `forms/layout` — layout options (columns, sections, groups)
- [x] `forms/schema` — schema-driven form generation
- [x] `forms/advanced` — conditional fields, lookups, array editors
- [x] `forms/validation` — validation rules, StatusList integration
- [x] `templates/editor` — editor template story (Tree + FormRenderer composition pattern)

### Component Design Documents (planned or missing)

- [x] Card component design — `docs/design/components/card.md`
- [x] Layout components design (Stack, Grid, Divider) — `docs/design/components/layout.md` (2026-03-27)
- [x] Data Table design — `docs/design/components/data-table.md`
- [x] Breadcrumb design — `docs/design/components/breadcrumbs.md`
- [x] Tooltip design — `docs/design/components/tooltip.md`
- [x] Conditional fields design — covered in `docs/design/components/multi-step-form.md` and forms feature doc
- [x] Multi-step form design — `docs/design/components/multi-step-form.md`
- [x] i18n design — `docs/design/15-i18n.md`
- [x] Density system design — `docs/design/14-density.md`
- [x] Whitelabeling guide — `docs/design/16-whitelabeling.md`
