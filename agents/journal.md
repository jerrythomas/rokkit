# Project Journal

Chronological log of confirmations, progress, milestones, and decisions.
Design details live in `docs/design/` — modular docs per module.

---

## 2026-02-24

### Monorepo Restructure + Legacy Cleanup

- Moved `packages/` and `sites/` into `solution/` directory (user-initiated)
- Fixed undeclared workspace dependencies exposed by restructuring (states, forms, ui → @rokkit/data; core → @unocss/preset-mini; chart → d3-format; stories → shiki; learn → ramda)
- Moved `tsconfig.json` into `solution/` (packages reference `../../tsconfig.json`)
- Added svelte, svelte-eslint-parser, globals to root devDependencies
- Updated `.husky/pre-commit` to `cd solution`
- Removed stale root `bun.lock`

### Legacy Component Cleanup (#8)

- `FieldLayout.svelte` — already migrated to Svelte 5 runes, kept as internal component
- Deleted `ListEditor.svelte` — broken (`./List.svelte` import doesn't exist), unused, not exported
- Deleted `NestedEditor.svelte` — broken (`generateTreeTable`, `deriveNestedSchema` don't exist), unused, not exported
- Deleted `DataEditor.svelte` — internal-only wrapper, no consumers after NestedEditor removal
- Deleted stale `__snapshots__/NestedEditor.spec.svelte.js.snap`
- All superseded by FormRenderer + List/Tree composition

**Tests:** 1267 CI — all passing. Lint: 0 errors.

---

### Forms Phase 7: Form Submission Handling (#19)

- Added `onsubmit` prop to `FormRenderer` — validate-before-submit flow
- When `onsubmit` provided: renders as `<form>` (not `<div>`), enables Enter-to-submit
- Submit flow: `validate()` → `onvalidate('*', data, 'submit')` → focus first error if invalid → call `onsubmit` → `snapshot()`
- Loading state via `data-form-submitting` attribute, fields become non-interactive
- Default submit/reset buttons rendered when `onsubmit` set (no custom `actions` snippet)
- Custom `actions` snippet prop receives `{ submitting, isValid, isDirty, submit, reset }`
- Reset button calls `formBuilder.reset()`, syncs data back to bindable prop
- Error handling: caught in `handleSubmit` (consumer handles errors in their callback)
- Added "Submit" tab to playground with contact form demo + simulated async submission

**Files modified:** `FormRenderer.svelte`, `input.css`, `forms/+page.svelte`
**Files modified (tests):** `FormRenderer.spec.svelte.js`
**Tests added:** 12 FormRenderer submission tests (form/div rendering, buttons, submit flow, validation, focus, loading state, reset, onvalidate, error handling)
**Tests:** 1267 CI — all passing. Lint: 0 errors.

**New public API:** `FormRenderer.onsubmit`, `FormRenderer.actions` (snippet)

---

### Forms Phase 6: ValidationReport Component (#14)

- Created `ValidationReport.svelte` — grouped summary of validation messages by severity
- Groups items by state (error, warning, info, success) with count headers
- Items render as `<button>` when `onclick` is provided (click-to-focus), `<div>` otherwise
- Empty state: renders nothing
- Added `messages` getter to FormBuilder — returns all validation messages sorted by severity
- CSS: severity-colored count badges, clickable item hover states
- Updated playground Validation tab to show ValidationReport with click-to-focus

**Files created:** `ValidationReport.svelte`, `spec/ValidationReport.spec.svelte.js`
**Files modified:** `builder.svelte.js`, `index.js`, `input.css`, `forms/+page.svelte`
**Tests added:** 12 ValidationReport tests, 4 FormBuilder messages getter tests
**Tests:** 1255 CI — all passing. Lint: 0 errors.

**New public API:** `FormBuilder.messages`, `ValidationReport` component

---

### Forms Phase 5: Recursive Group Rendering (#8 partial, #16)

- FormRenderer now renders `type: 'group'` elements as `<fieldset data-form-group>` with recursive child rendering
- Extracted element rendering into a `{#snippet renderElement(element)}` for recursion
- Group label renders as `<legend data-form-group-label>` (optional)
- Fixed FormBuilder `#convertToFormElement` to extract top-level properties (label, etc.) from combined group elements into props
- Fixed `Input.svelte` `{@const}` placement for Svelte 5 compatibility
- Added `[data-form-group]` and `[data-form-group-label]` CSS to base theme
- Added "Nested Form" demo tab to playground with address + emergency contact groups
- Deeply nested groups (group within group) supported

**Files modified:** `FormRenderer.svelte`, `Input.svelte`, `builder.svelte.js`, `input.css`, `forms/+page.svelte`
**Files created:** `spec/FormRenderer.spec.svelte.js`
**Tests added:** 7 FormRenderer group tests, 4 FormBuilder group tests
**Tests:** 1238 CI — all passing. Lint: 0 errors.

---

### Forms Playground Page

Created playground page at `/components/forms` with travel planner scenario. 7 tabbed demos: Input Form, Pick a Flight (display-table), Hotel Cards (display-cards), Itinerary Review (display-section + display-list), Mixed Layout (display + input), Validation, Dirty Tracking.

**Files created:** `sites/playground/src/routes/components/forms/+page.svelte`
**Files modified:** `sites/playground/src/lib/components.ts` (nav entry)

---

### Forms Phase 4: InputToggle Component (#15)

- Created `InputToggle.svelte` — thin wrapper around `@rokkit/ui` Toggle
- Converts string option arrays to `{ text, value }` objects automatically
- Registered as `toggle` in `defaultRenderers` registry
- Usage: `{ scope: '#/field', props: { renderer: 'toggle' } }` in layout
- Updated playground traveler form `travelClass` field to use toggle renderer

**Files created:** `input/InputToggle.svelte`, `spec/input/InputToggle.spec.svelte.js`
**Files modified:** `input/index.js`, `renderers.js`, `spec/input/index.spec.js`, `forms/+page.svelte`
**Tests added:** 8 InputToggle tests
**Tests:** 1227 CI — all passing. Lint: 0 errors.

---

### Forms Phase 3: Dirty Tracking (#9)

- Added `deepClone()` / `deepEqual()` helpers to builder (no external dependencies, handles $state proxies)
- `#initialData` snapshot taken at construction via `deepClone(data)`
- `isDirty` getter — compares current data vs initial snapshot
- `dirtyFields` getter — returns `Set<string>` of modified field paths
- `isFieldDirty(fieldPath)` — single field check
- `snapshot()` — updates initial snapshot to current data (post-save workflow)
- `reset()` — restores data to initial snapshot, clears validation
- `dirty: boolean` added to `FormElement.props` via `#convertToFormElement`
- `data-field-dirty` attribute added to `InputField.svelte`
- Playground "Dirty Tracking" tab with snapshot/reset buttons

**Files modified:** `builder.svelte.js`, `InputField.svelte`, `forms/+page.svelte`
**Tests added:** 14 dirty tracking tests in `builder.spec.svelte.js`
**Tests:** 1219 CI — all passing. Lint: 0 errors.

**New public API:** `FormBuilder.isDirty`, `FormBuilder.dirtyFields`, `FormBuilder.isFieldDirty()`, `FormBuilder.snapshot()`

---

### Forms Phase 1: FormBuilder Stability (#7) + Validation Integration (#13)

**FormBuilder stability (#7):**
- Replaced `$derived(new FormBuilder(...))` in FormRenderer with stable instance + `$effect` sync
- Builder's `$state` fields + `$derived` elements handle reactivity via setters
- Added `builder` prop to FormRenderer for external builder injection

**Validation integration (#13):**
- Added `validateField(fieldPath)`, `validate()`, `isValid`, `errors` to FormBuilder
- Wired into FormRenderer with `validateOn` prop ('blur'|'change'|'manual')
- External `onvalidate` callback for custom validation logic
- Validation messages flow to InputField via `message` prop as `{ state, text }` objects

**Ramda removal:** Removed `ramda` imports from FormBuilder, InputField, InfoField — replaced with native destructuring and strict equality checks.

**Files modified:** `builder.svelte.js`, `FormRenderer.svelte`, `InputField.svelte`, `InfoField.svelte`, `index.js`
**Tests added:** builder validation tests (11), validation.spec.js (37)
**Tests:** 1151 CI, 819 UI — all passing. Lint: 0 errors.

---

### Forms Phase 2: Type Renderer Registry (#12) + Display-Only Rendering (#60)

**Type Renderer Registry (#12):**
- Created `packages/forms/src/lib/renderers.js` — `defaultRenderers` map (21 type→component mappings) + `resolveRenderer()` with 3-level resolution (explicit renderer → type → fallback to InputText)
- Refactored `Input.svelte` — replaced 30-line if/else chain with registry-based `<svelte:component>` dispatch
- `renderers` prop flows FormRenderer → InputField → Input for custom type overrides

**Display-Only Rendering (#60):**
- 5 new display components: `DisplayValue` (format-aware: currency/datetime/duration/number/boolean/badge), `DisplaySection` (key-value pairs), `DisplayTable` (wraps @rokkit/ui Table), `DisplayCardGrid` (responsive grid with single/multi selection), `DisplayList` (styled list)
- FormBuilder handles `display-*` layout types, resolves data from scope, supports `renderer` hint for custom type overrides
- FormRenderer routes `display-*` elements to display components, new `onselect` prop
- `packages/themes/src/base/display.css` — base structural CSS with responsive grid

**Files created:** `renderers.js`, `display/DisplayValue.svelte`, `display/DisplaySection.svelte`, `display/DisplayTable.svelte`, `display/DisplayCardGrid.svelte`, `display/DisplayList.svelte`, `display/index.js`, `base/display.css`
**Files modified:** `Input.svelte`, `InputField.svelte`, `FormRenderer.svelte`, `builder.svelte.js`, `forms/index.js`, `base/index.css`
**Tests added:** `renderers.spec.js` (10), `DisplayValue.spec` (13), `DisplaySection.spec` (9), `DisplayList.spec` (7), `DisplayCardGrid.spec` (10), builder display tests (5)
**Tests:** 1205 CI, 819 UI — all passing. Lint: 0 errors.

**New public API:** `defaultRenderers`, `resolveRenderer`, `DisplayValue`, `DisplayTable`, `DisplayCardGrid`, `DisplaySection`, `DisplayList`
**Layout types:** `display-table`, `display-cards`, `display-section`, `display-list`

---

### Housekeeping: Consolidate .rules → agents, split backlog

**Consolidated `.rules/` into `agents/`:**
- Created `agents/references.md` — coding conventions, styling rules (theme/layout separation), story conventions, color system, architecture principles, project structure table
- Removed `.rules/` folder entirely (16 files across 4 subdirectories)
- Updated `CLAUDE.md` — proper project description, correct commands, references new file, removed placeholder text
- Content preserved from .rules where unique; agents/ content preferred where conflicts existed
- Outdated bits-ui references in .rules discarded (ADR-003 removed bits-ui)

**Split backlog into priority-ordered files:**
- `agents/backlog/01-forms.md` — FormBuilder stability, validation, display schemas, legacy migration, dirty tracking (items #7-22, #60)
- `agents/backlog/02-ui-components.md` — Table phases 2-4, FloatingNav, Button styles, type-ahead, MultiSelect value contract (items #3, #11, #28, #46-51)
- `agents/backlog/03-effects.md` — HoverLift, Magnetic, Ripple, Glow, decorative components (items #53-57)
- `agents/backlog/04-infrastructure.md` — Ramda removal, Svelte 4→5 migration, chart cleanup (items #23-25, #58)
- `agents/backlog/05-charts.md` — Full visualization suite (item #59)
- Removed all completed items (items #1, #4-6, #10, #26-27, #29-45, #48, #52)
- `agents/backlog.md` now a pointer to the directory

**Documented backlog #60 as requirement:**
- Added §18 "Display-Only Schema Rendering" to `docs/requirements/010-form.md`
- Added design section to `docs/design/010-form.md` — DisplayValue component, FormBuilder integration, FormRenderer routing, data attributes
- Updated gaps summary in both docs

### Chart Visualization Suite — Backlog #59 Created

Created comprehensive requirements and design docs for the chart package overhaul:

**Files created:**
- `docs/requirements/020-chart.md` — updated from skeleton to full requirements covering: 6 chart types (bar, line, area, scatter, pie, sparkline), animated time series (chart race), data mapping & brewer, SVG/PNG/animated SVG export, accessibility, theme integration
- `docs/design/020-chart.md` — full technical design: AnimatedChart wrapper architecture, custom tweened store for object array interpolation, TimelineControls, VisualBrewer (data→pattern+color+symbol), Sparkline component, SVG export pipeline (static + raster + SMIL animated), @rokkit/data rollup integration for keyframe alignment, 5-phase implementation plan

**Backlog #59 added** with 5 phases: Foundation & Static Charts → Chart Type Components → Animated Time Series → Animated Export & Polish → Advanced Features

**Key design decisions:**
- All rendering in SVG (not HTML elements like the reference example)
- AnimatedChart is a wrapper; base charts have zero animation awareness
- @rokkit/data rollup provides keyframe alignment (groupDataByKeys + fillAlignedData)
- VisualBrewer assigns pattern + color + symbol per distinct data value with tailwind shade ramps (50–950)
- Sparklines drawn from FitTrack analytics card patterns (metric sparkline: headline stat + trend + mini chart + summary)
- Animated SVG export uses SMIL `<animate>` for standalone playback

**Research sources:** russellgoldenberg/svelte-bar-chart-race (tweened stores, rank-based bar repositioning, timer controls), existing chart package (patterns, symbols, palette, ChartBrewer, swatch, old_lib/brewer), @rokkit/data rollup.js, fitness project analytics requirements (sparkline/dashboard card anatomy)

---

### Reveal Effect — Backlog #52 Complete

Implemented scroll-triggered reveal animations: `use:reveal` action + `Reveal` wrapper component.

**Files created:**
- `packages/actions/src/reveal.svelte.js` — action: IntersectionObserver + CSS data-attribute transitions, `prefers-reduced-motion` bypass
- `packages/ui/src/components/Reveal.svelte` — component: wraps action, adds stagger support (DOM-based child delay iteration)
- `packages/themes/src/base/reveal.css` — base CSS for `[data-reveal]` + `[data-reveal-visible]` transitions
- `packages/actions/spec/reveal.spec.svelte.js` — 22 action tests (attributes, CSS vars, observer lifecycle, once/repeat, reduced-motion, cleanup)
- `packages/ui/spec/Reveal.spec.svelte.ts` — 16 component tests (rendering, CSS vars, observer, class, stagger)
- `sites/playground/src/routes/components/reveal/+page.svelte` — playground page with single + staggered demos

**Files modified:** actions index.js (export), actions index.spec.js (expected keys), themes base index.css (import), ui components/index.ts + index.ts (export), playground components.ts (nav entry)

**Tests:** 1099 CI + 819 UI all pass. Lint: 0 new errors.

---

## 2026-02-23

### New Requirements — FloatingNavigation, Button Styles, Interactive Effects (Enriched)

Added requirements, design docs, and backlog entries based on reference site at `/Users/Jerry/Work/website/site` (React + Framer Motion).

**Additional patterns discovered from deeper reference site analysis:**
- **SectionDivider** (Backlog #55): Animated decorative divider — lines scale in from edges, dots pop in center. IntersectionObserver triggered. Added to `060-effects.md §11`.
- **GradientText** (Backlog #56): CSS utility for gradient-colored text via `background-clip: text`. Added to `060-effects.md §12`.
- **BackgroundOrbs** (Backlog #57): Decorative blurred gradient circles for hero/section backgrounds. Added to `060-effects.md §13`.
- Reference site button patterns confirmed: gradient CTA (`from-orange-500 to-pink-500`), `group-hover:translate-x-1` trailing arrow, outline-with-brand-color variant, white/transparent CTA variants. All covered by existing Backlog #51.

**FloatingNavigation** (Backlog #50):
- Requirements added to `docs/requirements/009-navigation.md §6` — data-driven collapsible floating nav with 4-edge positioning, pin toggle, IntersectionObserver active tracking, CSS animations
- Design doc created: `docs/design/009-floating-navigation.md` — architecture, position layouts, animation strategy (pure CSS), template structure, size variants

**Button Style Enhancements** (Backlog #51):
- Requirements added to `docs/requirements/001-button.md §6` — new `gradient` and `link` style variants, standardized micro-animations (press feedback, hover lift, focus ring, icon shift, loading pulse, pop on click) across all themes

**Interactive Effects** (Backlog #52–54):
- Requirements rewritten: `docs/requirements/060-effects.md` — expanded from 6 vague sections to 14 detailed sections covering:
  - `Reveal` component + `use:reveal` action (scroll-triggered entry animations) — highest priority
  - `use:hoverLift`, `use:magnetic`, `use:ripple` actions
  - `Glow` and `FloatingBubbles` decorative components
  - CSS utility animations (`rk-float`, `rk-shimmer`, `rk-pulse-glow`)
  - `prefers-reduced-motion` support mandate

**Backlog entries:** #50 (FloatingNavigation), #51 (Button styles), #52 (Reveal), #53 (HoverLift/Magnetic/Ripple), #54 (Glow/FloatingBubbles)

---

### Tree — Lazy Loading of Children — Backlog #6 Complete

Implemented async lazy loading for Tree nodes. Convention: `children: true` (boolean, not array) marks a node as "has children, not yet loaded."

**Changes:**
- `ItemProxy` (`packages/ui/src/types/item-proxy.ts`): Added `canLoadChildren` getter — detects truthy non-array children field
- `TreeProps` (`packages/ui/src/types/tree.ts`): Added `onloadchildren?: (value, item) => Promise<TreeItem[]>` callback
- `Tree.svelte` (`packages/ui/src/components/Tree.svelte`):
  - `loadingPaths` state (Set) tracks nodes currently loading
  - `loadVersion` counter forces `$derived` re-computation after in-place mutation
  - `loadLazyChildren(pathKey)` async helper: calls callback, mutates item's children, updates controller
  - `toggleNodeByKey` made async: intercepts expanding lazy nodes, skips double-toggle when `expandAll` already expanded the loaded node
  - `handleTreeKeyDown` intercepts ArrowRight for lazy nodes before navigator
  - Template: spinner in toggle button during loading, `aria-busy`, `data-tree-loading`
  - `FlatNode.isExpandable` includes `canLoadChildren` for connectors/toggle visibility
- `base/tree.css`: Loading spinner styles (`[data-tree-spinner]` with border animation)
- 6 new tests: expand toggle for lazy nodes, onloadchildren callback, children rendering after load, no re-call after loaded, rejection handling, nested lazy loading
- Playground: "Lazy Loading" demo with simulated 800ms async load, nested lazy folders

**Key insight:** After `loadLazyChildren` mutates item children and calls `syncExpandedToController()`, if `expandAll=true` the node is already expanded. Must skip `toggleExpansion()` to avoid toggling it back to collapsed.

**Tests:** 803 UI + 1075 CI — all pass.

---

### Timeline — View-Only Vertical Steps Component — Backlog #43 Complete

New component for instructions, changelogs, and process visualization. Purely presentational — no interaction, no state controller.

**Architecture:**
- Single `Timeline.svelte` with `ItemProxy` for field mapping (text, icon, description)
- `completed` / `active` boolean fields on items for state indicators
- Completed items show check icon (configurable), others show step number or custom icon
- `content` snippet for rich custom content per step
- Connector lines between items (except last)
- ARIA: `role="list"` / `role="listitem"`, `aria-hidden` on markers

**Files created:**
- `packages/ui/src/types/timeline.ts` — TimelineProps, TimelineFields, TimelineIcons
- `packages/ui/src/components/Timeline.svelte` — Timeline component
- `packages/themes/src/base/timeline.css` — structural styles
- `packages/themes/src/{rokkit,glass,material,minimal}/timeline.css` — 4 theme files
- `packages/ui/spec/Timeline.spec.svelte.ts` — 21 tests
- `sites/playground/src/routes/components/timeline/+page.svelte` — playground page

**Tests:** 786 UI, 1067 CI — all passing.

---

### Range — Custom Slider Component — Backlog #48 Complete

Migrated and consolidated the archived Range slider (4 files: Range, RangeMinMax, RangeSlider, RangeTick) into a single `Range.svelte` component.

**Architecture:**
- Single component with `range` boolean prop for dual-handle mode
- `lerp`/`inverseLerp` inline helpers replace D3 `scaleLinear` (same pattern as Tilt)
- `use:pannable` from `@rokkit/actions` for drag interaction on thumbs
- `generateTicks` from `@rokkit/core` for tick mark generation
- Snap-to-step on drag end and keyboard input
- ArrowLeft/Right/Up/Down for increment/decrement, Home/End for min/max

**Files created:**
- `packages/ui/src/types/range.ts` — RangeProps interface
- `packages/ui/src/components/Range.svelte` — Range component
- `packages/themes/src/base/range.css` — structural styles
- `packages/themes/src/{rokkit,glass,material,minimal}/range.css` — 4 theme files
- `packages/ui/spec/Range.spec.svelte.ts` — 31 tests
- `sites/playground/src/routes/components/range/+page.svelte` — playground page

**Files modified:**
- `packages/ui/src/components/index.ts` — added Range export
- `packages/ui/src/index.ts` — added Range to named re-exports
- `packages/ui/src/types/index.ts` — added range type export
- `packages/themes/src/base/index.css` + 4 theme `index.css` — added range.css imports

**Tests:** 765 UI, 1067 CI — all passing.

---

### Table Learn Site Page + index.ts Fix

Added learn site page for Table component following List page pattern.

**Files created:**
- `sites/learn/src/routes/(learn)/elements/table/+page.svelte` — article with intro, sorting, custom columns, filtering sections
- `sites/learn/src/routes/(learn)/elements/table/stories.js` — StoryBuilder wiring
- `sites/learn/src/routes/(learn)/elements/table/{intro,sorting,filtering,custom-columns}/App.svelte` — 4 examples
- `sites/learn/src/routes/(learn)/elements/table/fragments/{01-data-object.js,02-custom-columns.js,03-search-filter.svelte}` — code snippets

**Fix:** Added `Table` and `SearchFilter` to `packages/ui/src/index.ts` named re-exports (were in `components/index.ts` but missing from top-level barrel).

---

### Table Component Phase 1 + SearchFilter — Backlog #47 Phase 1 + #10 Complete

Implemented flat Table component with sortable columns, keyboard navigation, and standalone SearchFilter component. Multi-package feature spanning `@rokkit/data`, `@rokkit/states`, `@rokkit/ui`, and `@rokkit/themes`.

**Architecture:**
- `TableController` in `@rokkit/states` — composition wrapping `ListController` (not inheritance). Manages columns, sort state (single + multi-column via Shift+click), delegates focus/selection/navigation to internal ListController.
- `Table.svelte` — creates `TableController`, uses `use:navigator` for keyboard/click on rows, sort via `<th>` click handlers. Auto-derives columns from data via `deriveColumns()`. Supports custom columns with field mapping, formatters.
- `SearchFilter.svelte` — standalone component parsing user input with `parseFilters()` from `@rokkit/data`. Debounced input, filter tags with remove, clear button. Composes with Table via `filterData()`.

**Files created:**
- `packages/ui/src/types/table.ts` — TableColumn, TableProps, SortState, TableSortIcons types
- `packages/ui/src/types/search-filter.ts` — SearchFilterProps, FilterObject types
- `packages/states/src/table-controller.svelte.js` — TableController class (replaces old TableWrapper stub)
- `packages/ui/src/components/Table.svelte` — Table component
- `packages/ui/src/components/SearchFilter.svelte` — SearchFilter component
- `packages/themes/src/base/table.css` + `search-filter.css` — structural styles
- `packages/themes/src/{rokkit,glass,material,minimal}/table.css` — 4 theme files
- `packages/themes/src/{rokkit,glass,material,minimal}/search-filter.css` — 4 theme files
- `packages/ui/spec/Table.spec.svelte.ts` — 26 tests
- `packages/ui/spec/SearchFilter.spec.svelte.ts` — 13 tests
- `sites/playground/src/routes/components/table/+page.svelte` — playground page

**Files modified:**
- `packages/data/src/index.js` — exported `deriveColumns`, `deriveMetadata`, `deriveSortableColumn`, `parseFilters`, `filterData`, `filterObjectArray` (backlog #10)
- `packages/states/src/index.js` — replaced `TableWrapper` with `TableController` export
- `packages/ui/src/types/index.ts` — added table + search-filter type exports
- `packages/ui/src/components/index.ts` — added Table + SearchFilter component exports
- `packages/themes/src/base/index.css` + 4 theme `index.css` — added table + search-filter imports
- `packages/data/spec/index.spec.js` + `packages/states/spec/index.spec.js` — updated export tests
- `packages/states/spec/tabular.spec.svelte.js` — replaced TableWrapper tests with TableController tests

**Tests:** 734 UI, 1067 CI — all passing.

---

### NestedController Tree-style Focus Navigation — Backlog #29 Complete

Added WAI-ARIA treeview keyboard patterns to NestedController:

- **ArrowRight on expanded group** → focus first child (was no-op)
- **ArrowLeft on child** → focus parent (was no-op)
- **ArrowRight on leaf** → no-op (correctly returns false)
- **ArrowLeft on root** → no-op (correctly returns false)
- **Expand on leaf** → returns false (node has no children)

**Files modified:**
- `packages/states/src/nested-controller.svelte.js` — `expand()` checks for children, moves to first child when already expanded. `collapse()` moves to parent when not expandable.
- `packages/actions/src/navigator.svelte.js` — emits `'move'` event + scroll when expand/collapse changes focus (so Tree/List update DOM focus)
- `packages/states/spec/nested-controller.spec.svelte.js` — 8 new tests, 1 updated expectation

**Tests:** 655 UI, 1055 CI — all passing.

---

### Stepper Component — Backlog #38 Complete

Built a new Stepper component for multi-step wizard indicators (onboarding, checkout flows).

**Design decisions:**
- Single `Stepper.svelte` (no sub-components) — steps/dots are tightly coupled to stepper layout
- No controller/navigator needed — simple clickable buttons, not a focus-roving widget
- CSS connector lines via data attributes, not SVG Connector component
- Sub-stage dots when `step.stages > 1`

**Component:** `packages/ui/src/components/Stepper.svelte`
- TypeScript interfaces: `StepperStep`, `StepperIcons`, `StepperProps`
- `$bindable` current/currentStage, linear mode (only completed + next clickable)
- Horizontal/vertical orientation, custom completed icon, content snippet
- ARIA: `role="group"`, `aria-current="step"`, `aria-label` on buttons

**Files created:**
- `packages/ui/src/components/Stepper.svelte`
- `packages/ui/spec/Stepper.spec.svelte.ts` (29 tests)
- `packages/themes/src/base/stepper.css`
- `sites/playground/src/routes/components/stepper/+page.svelte`
- `sites/learn/src/routes/(learn)/layout/stepper/` — full story (stories.js, intro/App.svelte, fragments/01-basic.svelte, +page.svelte)

**Files modified:**
- `packages/ui/src/components/index.ts`, `packages/ui/src/index.ts` — added exports
- `packages/themes/src/base/index.css` — added CSS import
- `sites/playground/src/lib/components.ts` — added nav entry

**Tests:** 655 UI, 1047 CI — all passing. Learn site builds.

---

### Learn Site Stories — Phase 2b Complete

Created new interactive stories for all existing components and updated existing ones:

**New stories created:**
- `elements/toggle` — intro, fields, configuration examples
- `elements/toolbar` — intro, separators examples
- `elements/menu` — intro, groups examples
- `elements/carousel` — intro, transitions examples
- `elements/breadcrumbs` — intro example
- `primitives/button` — intro, variants examples (replaced ComingSoon)
- `primitives/card` — intro, snippets examples (replaced ComingSoon)
- `primitives/code` — intro example (new route)
- `layout/progress` — intro, indeterminate examples (replaced ComingSoon)

**Updated stories:**
- `primitives/pill` — text corrections (ItemWrapper → Pill)
- `input/rating` — fixed broken `<section>` tag, heading levels h1→h2
- `elements/list` — added nested/collapsible groups example

**Layout improvements:**
- Added breadcrumb navigation to `(learn)/+layout.svelte`
- Fixed `findGroupForSection` to use `slug` instead of `id`

Learn site builds. All tests pass: 626 UI, 1047 CI.

---

### Learn Site Build — Phase 2a Complete

Fixed all broken imports preventing the learn site from building:

**Root causes fixed:**
- `uno.config.js`: imported JS (`iconShortcuts`, `defaultIcons`, `Theme`) from `@rokkit/themes` (CSS-only) → changed to `@rokkit/core`
- `ThemeSwitcher.svelte`: `ToggleThemeMode` from `@rokkit/ui` → `ThemeSwitcherToggle` from `@rokkit/app`
- `Connector` missing from `@rokkit/ui` barrel export → added to `index.ts`

**Shared components fixed (Icon → CSS class span):**
- `ComingSoon.svelte`, `CopyToClipboard.svelte`, learn `Header.svelte`, root `Header.svelte`
- `Sidebar.svelte`: added `collapsible` prop to List, replaced Icon with CSS span
- `DropDown.svelte`: removed `Item` import, inline text rendering
- `tabs/orientation/Controls.svelte`: `Switch` → `Toggle`
- `pill/intro/App.svelte`: removed `Item` import/mapping
- `list/mixed/App.svelte`: removed `Item` import

**Broken story routes → ComingSoon:**
Removed story subdirectories and replaced +page.svelte with ComingSoon for:
- Routes: accordion, table, icon, item, calendar, range, stepper
- Stories: inputfield, validation-report, responsive-grid, templates/editor
- Forms stories: overview, schema, layout, validation, advanced

**Kept valid stories intact:** List, Select, MultiSelect, Tabs, Pill, Rating, Connector, nav-content, forms/inputs, charts

Learn site builds successfully. All tests pass: 626 UI, 1047 CI.

---

### Table & Range — Backlog Corrections

Corrected plan status for Table and Range:
- **Table** (#47): NOT "separate package" — has full requirements (`docs/requirements/004-table.md`) and design (`docs/design/004-table.md`) as a `@rokkit/ui` component. Multi-phase: flat+SearchFilter → hierarchy → pagination → polish. Uses `TableController` in `@rokkit/states`, `@rokkit/data` utilities for columns/sorting/filtering.
- **Range** (#48): Current `InputRange` in forms is a minimal native wrapper. The archived custom slider had dual handles, tick marks, step markers, styled ends/selected range, pannable thumbs. Needs full migration to `@rokkit/ui` as a standalone component.

---

### Pill & Rating — Phase 1 Complete (backlog #44, #45)

Migrated both components from archive to Svelte 5:

**Pill** (`packages/ui/src/components/Pill.svelte`):
- Tag/chip with optional remove button
- `ItemProxy` for field mapping, `use:keyboard` for Delete/Backspace removal
- Props: value, fields, removable, disabled, onremove, content (snippet), class
- Data attributes: `data-pill`, `data-pill-icon`, `data-pill-text`, `data-pill-remove`, `data-pill-disabled`
- 16 unit tests

**Rating** (`packages/ui/src/components/Rating.svelte`):
- Star/icon rating input with keyboard navigation
- ARIA: `role="radiogroup"` container, `role="radio"` per star
- Keyboard: ArrowLeft/Right/Up/Down, digit keys for direct set
- Props: value (bindable), max, disabled, filledIcon, emptyIcon, onchange, class
- Data attributes: `data-rating`, `data-rating-item`, `data-filled`, `data-hovering`, `data-rating-disabled`
- 26 unit tests

Also added: base CSS (pill.css, rating.css), playground pages, nav entries, LLM docs (ui.md, themes.md, README.md updated to 24 components).

All tests pass: 626 UI, 1047 CI.

---

### Learn Site Audit — Component Gap Analysis

Audited all learn site routes against current `@rokkit/ui` exports. Identified:
- **2 components to migrate** (Pill, Rating) — needed by learn stories, added to backlog #44, #45
- **5 deprecated stories to remove** (Accordion, DropDown, Switch, Icon, Message)
- **9+ new stories to create** (Toggle, Toolbar, Menu, Carousel, Card, Button, ProgressBar, BreadCrumbs, Code)
- **3 stories to update** (List add collapsible, Item fix import, Select/MultiSelect/Tabs review)
- **Header** already supports breadcrumbs prop but layout doesn't pass data
- **Build blocker**: pre-existing CSS import error prevents learn site from building

Created plan in `agents/plan.md` with Phase 1 (migrate Pill + Rating) and Phase 2 (learn site story updates). Updated backlog with #44 Pill, #45 Rating, #46 Learn Site Stories.

---

### Carousel — New Component

Built a Carousel component using `use:swipeable` + `use:keyboard` actions (no ListController needed).

**Actions used:**
- `use:swipeable` — touch/mouse swipe gestures → `swipeLeft`/`swipeRight` events
- `use:keyboard` — maps ArrowLeft/Right/Home/End → `prev`/`next`/`first`/`last` custom events

**Features:**
- Slide/fade/none transitions via CSS `data-carousel-transition` attribute + CSS custom properties (`--carousel-current`)
- Autoplay with pause-on-hover, configurable interval
- Loop/wrap option (disables arrows at boundaries when off)
- Prev/next arrow buttons + dot navigation
- ARIA: `role="group"` + `aria-roledescription="carousel"`, dots as `role="tab"`, slides as `role="tabpanel"`
- Bindable `current` index

**Files created:**
- `packages/ui/src/components/Carousel.svelte`
- `packages/ui/spec/Carousel.spec.svelte.ts` (22 tests)
- `packages/themes/src/base/carousel.css`
- `sites/playground/src/routes/components/carousel/+page.svelte`

**Tests:** 1047 unit (584 UI) — all passing. Playground builds.

---

### BreadCrumbs, Card, ProgressBar — Migrate from Archive

Migrated three presentational components from archive to `@rokkit/ui` with Svelte 5 runes, TypeScript types, data-attribute theming, and proper ARIA.

**BreadCrumbs** — navigation breadcrumbs with `nav`/`ol`/`li` ARIA pattern:
- Uses `ItemProxy` for field mapping (text, value, icon)
- Last item marked `aria-current="page"`, non-last rendered as buttons
- Custom separator icon, custom crumb snippet support

**Card** — flexible content container:
- Renders as `<div>` (static), `<a>` (href), or `<button>` (onclick)
- Snippet-based `header`, `footer`, `children` slots

**ProgressBar** — determinate/indeterminate progress indicator:
- `role="progressbar"` with `aria-valuenow/min/max`
- Indeterminate mode when `value` is null (CSS animation)
- Percentage clamped to 0-100%

**Files created:**
- `packages/ui/src/components/BreadCrumbs.svelte`, `Card.svelte`, `ProgressBar.svelte`
- `packages/ui/spec/BreadCrumbs.spec.svelte.ts` (16 tests), `Card.spec.svelte.ts` (7 tests), `ProgressBar.spec.svelte.ts` (13 tests)
- `packages/themes/src/base/breadcrumbs.css`, `card.css`, `progress.css`
- `sites/playground/src/routes/components/breadcrumbs/+page.svelte`, `card/+page.svelte`, `progress/+page.svelte`

**Files modified:**
- `packages/ui/src/components/index.ts`, `packages/ui/src/index.ts` — added exports
- `packages/themes/src/base/index.css` — added CSS imports
- `sites/playground/src/lib/components.ts` — added nav entries

**Tests:** 1047 unit (562 UI) — all passing. Playground builds.

---

### Tilt & Shine — Migrate Effect Components from Archive

Migrated two visual effect components from archive to `@rokkit/ui` with Svelte 5 runes, TypeScript types, and data-attribute theming.

**Tilt** — parallax tilt effect responding to mouse position:
- Replaced D3 `scaleLinear` with simple `lerp()` function (zero new dependencies)
- CSS variables: `--tilt-perspective`, `--tilt-rotate-x`, `--tilt-rotate-y`, `--tilt-brightness`
- Props: `maxRotation`, `setBrightness`, `perspective`

**Shine** — specular lighting effect using SVG `feSpecularLighting` + `fePointLight`:
- Uses `@rokkit/core` `id()` for unique SVG filter IDs
- Props: `color`, `radius`, `depth`, `surfaceScale`, `specularConstant`, `specularExponent`

**Files created:**
- `packages/ui/src/components/Tilt.svelte`, `Shine.svelte`
- `packages/ui/spec/Tilt.spec.svelte.ts` (12 tests), `Shine.spec.svelte.ts` (12 tests)
- `packages/themes/src/base/tilt.css`, `shine.css`
- `sites/playground/src/routes/components/tilt/+page.svelte`, `shine/+page.svelte`

**Files modified:**
- `packages/ui/src/components/index.ts`, `packages/ui/src/index.ts` — added exports
- `packages/themes/src/base/index.css` — added CSS imports
- `sites/playground/src/lib/components.ts` — added nav entries

**Tests:** 1047 unit (526 UI), 213 e2e — all passing.

---

### Toolbar — Add ListController + Navigator (ADR-003 pattern)

Added arrow-key navigation to Toolbar via `ListController` + `use:navigator`, following the same pattern used in Toggle, Tabs, and List.

**Key design decisions:**
- Separators and spacers don't get `data-path` attributes → invisible to navigator, naturally skipped
- `ListController#isDisabled()` skips disabled items during arrow-key navigation
- `focusin` listener syncs controller position when items receive focus externally (e.g. Tab)
- Removed `onclick`/`onkeydown` from `defaultItem` buttons — navigator handles all clicks and keyboard via `action` events
- `createHandlers()` still provides `onclick`/`onkeydown` for custom snippets
- Orientation derived from `position` prop: left/right → vertical (ArrowUp/Down), top/bottom → horizontal (ArrowLeft/Right)

**Files modified:**
- `packages/ui/src/components/Toolbar.svelte` — added controller + navigator integration
- `packages/ui/spec/Toolbar.spec.svelte.ts` — added 12 new tests (arrow keys, Home/End, skip separators/spacers/disabled, vertical orientation)

**Files created:**
- `sites/playground/e2e/toolbar.spec.ts` — 25 e2e tests (keyboard, mouse, visual snapshots × 5 themes × 2 modes)

**Tests:** 1047 unit (502 UI), 213 e2e — all passing.

### ADR-003 Phase D — Remove @rokkit/composables

Deleted the `@rokkit/composables` package (55 files, 26 tests). No active consumers remained (all migrated in Phase A).

Also assessed Proxy/ItemProxy unification (Phase C item) and deferred — they are fundamentally different abstractions: `states.Proxy` is reactive+mutable data model, `ItemProxy` is read-only view-layer field mapper.

**What was removed:**
- `packages/composables/` — entire directory (List, GroupedList, Switch, TabGroup, FloatingNav)
- `docs/llms/composables.md` — LLM reference doc
- Composables entries from: llms/README.md, .rules/project/structure.md, agents/memory.md
- Composables import references from: learn site LLM generators, commented import in tabs page

**What was updated:**
- `bun.lock` — regenerated (1 package removed: bits-ui)
- `docs/llms/states.md` — updated "Depended on by" list
- `docs/decisions/003-mvc-separation.md` — marked Phase D complete

**Tests:** 1047 unit tests (125 files), all passing. Delta: -26 tests (composables tests removed), -8 test files.

**ADR-003 is now fully complete** (Phases A–D).

---

### Tree — Migrated to NestedController + use:navigator (ADR-003 Phase C)

Sixth component in Phase C. Most complex migration — hierarchical data with expand/collapse, tree lines/connectors, ArrowLeft/Right for expand/collapse and parent navigation.

**Key decisions:**
- Used `NestedController` (not `ListController`) — Tree has true nested expand/collapse.
- Navigator with `nested: true` — maps ArrowLeft→collapse, ArrowRight→expand via kbd.js `getVerticalExpandActions`.
- Kept `flattenTree()` for rendering (computes `lineTypes`, `level`, `isLast` per node) — reads expansion from `controller.expandedKeys`.
- Same pathKey↔nodeKey sync pattern as List: `expanded` prop uses node values as keys (e.g., `{ src: true }`), controller uses path keys (e.g., `"0"`). `syncExpandedToController()` bridges them.
- `expandAll` populates all parent nodes into controller's `expandedKeys` during sync.
- `data-path` on `data-tree-item-content` elements for navigator click/focus interception.
- Toggle buttons (`data-tree-toggle-btn`) call `toggleNodeByKey()` directly, don't use `data-path`.

**What was removed:**
- `focusedPath` state, `focusPath()`, inline `handleFocusIn()`, `handleItemKeyDown()` (~80 lines keyboard switch)
- `handleItemSelect()`, `internalExpanded` / `effectiveExpanded`, `isNodeExpanded()` / `toggleNode()`

**Files changed:**
- `packages/ui/src/components/Tree.svelte` — full migration
- `docs/decisions/003-mvc-separation.md` — marked Tree checkbox

**Tests:** 1073 unit tests (457 UI, 37 Tree) all passing, no test changes needed.

---

### Toolbar — Skipped Migration (ADR-003 Phase C)

Assessed Toolbar.svelte (198 lines). **Decision: skip** — minimal keyboard code (~7 lines Enter/Space only), no arrow navigation, relies on native tab order. Supports non-interactive items (separator, spacer) and slot-based content that would complicate controller integration.

---

### MultiSelect — Migrated to ListController + use:navigator (ADR-003 Phase C)

Fifth component in Phase C. Same dropdown pattern as Select with toggle selection (don't close on select) and array-of-items value binding.

**Key decisions:**
- Same `Map<unknown, string>` pattern as Select for `itemPathMap`.
- `handleSelectAction()` calls `toggleItemSelection()` instead of closing dropdown.
- No `lastSyncedValue` guard needed — MultiSelect's value is array of full items, not a single primitive.

**Files changed:**
- `packages/ui/src/components/MultiSelect.svelte` — full migration
- `docs/decisions/003-mvc-separation.md` — marked MultiSelect checkbox

**Tests:** 1073 unit tests (457 UI) all passing, no test changes needed.

---

### Select — Migrated to ListController + use:navigator (ADR-003 Phase C)

Fourth component in Phase C (after Toggle, List, Menu). Same dropdown pattern as Menu with additional concerns: bindable `value`/`selected`, `lastSyncedValue` guard, maxHeight measurement, check mark rendering.

**Key decisions:**
- Used `Map<unknown, string>` (not `WeakMap`) for `itemPathMap` — Select supports string/number arrays (`['foo', 'bar']`) where items are primitives, not objects.
- `lastSyncedValue` guard pattern (from Toggle) prevents value-sync `$effect` from fighting navigator focus moves.
- `scrollIntoView?.()` with optional chaining — forms tests run in JSDOM which doesn't implement `scrollIntoView`.
- On `openDropdown()`: focuses selected item via `controller.moveToValue(value)`, or first item if no selection.

**What was removed:**
- `focusedIndex` state tracking
- `focusItem()` — manual DOM query + focus + scroll
- `handleKeyDown()` — 35-line keyboard switch
- `handleItemKeyDown()` — per-item Enter/Space handler

**Files changed:**
- `packages/ui/src/components/Select.svelte` — full migration
- `docs/decisions/003-mvc-separation.md` — marked Select checkbox

**Tests:** 1073 unit tests (457 UI) all passing, no test changes needed.

---

## 2026-02-22

### Menu — Migrated to ListController + use:navigator (ADR-003 Phase C)

Third component in Phase C (after Toggle, List). Replaced inline keyboard/focus code in Menu.svelte with `ListController` + `use:navigator`.

**Key decisions:**
- Used `ListController` (not `NestedController`) — Menu groups are presentation-only headers, not collapsible. All children are flattened into a single navigable list.
- Pre-flattens `options` into `flatItems` (leaf items only) for the controller. Groups are skipped. Uses `WeakMap<object, string>` to map raw item objects → flat index keys for `data-path`.
- Navigator is applied to the dropdown container (`[data-menu-dropdown]`), not the root `[data-menu]`. Trigger button keyboard handling (ArrowDown/Up → open + focus first/last) remains manual.
- Escape and click-outside remain document-level listeners (toggled via `$effect` when `isOpen` changes).
- Enter/Space on individual items uses `stopPropagation()` to prevent navigator from double-handling. This preserves backward compat for custom snippet `handlers.onkeydown`.
- Dropped wrapping behavior (ArrowDown on last item no longer wraps to first) — matches WAI-ARIA standard.

**What was removed:**
- `focusedIndex` state tracking
- `focusItem()` — manual DOM query + focus
- `handleKeyDown()` — 35-line keyboard switch (ArrowDown/Up wrapping, Home/End, Enter/Space, Escape)
- `handleItemKeyDown()` — per-item Enter/Space handler

**What was added:**
- `ListController` + `use:navigator` for arrow keys, Home/End, disabled skip, focus tracking
- `flatItems` derived (pre-flatten groups → children for controller)
- `itemPathMap` derived (`WeakMap` for raw item → flat index key)
- Action event listener for 'move' (focus DOM) and 'select' (fire onselect + close)
- `handleFocusIn` to sync DOM focus → controller

**Files changed:**
- `packages/ui/src/components/Menu.svelte` — full migration
- `docs/decisions/003-mvc-separation.md` — marked Menu checkbox

**Tests:** 1073 unit tests (457 UI) all passing, no test changes needed.

---

### Fix Issues from docs/issues/001.md — All Resolved

Fixed 6 reported issues (3 were already implemented). `docs/issues/001..md` cleared.

**Bug fixes:**
1. **Input text value binding** — already fixed in `b660d747`. Added regression test in `InputText.spec.svelte.js`.
2. **Menu first item highlighted** — added `tabindex="-1"` to menu item buttons (WAI-ARIA menu pattern), removed focus-within outline ring from dropdown container.

**Style fixes:**
3. **Select inside input-root: extra thick border / 2px→1px / height mismatch** — root cause was `data-select` using `display: inline-block` inside flex `data-input-root`, creating a baseline gap. Fix: `data-select` now uses `display: flex; self-stretch` and trigger uses `flex-1; self-stretch; min-width: 0` in base/input.css.
4. **Danger button text invisible in dark mode** — changed outline/ghost danger text from `text-danger-z6` to `text-danger-z4` (semantic shortcut handles both light/dark) in rokkit/button.css.
5. **Minimal theme underline inputs** — already implemented correctly.
6. **Material theme floating label inputs** — already implemented correctly.
7. **menu-opened/menu-closed icons** — already in defaultIcons, icon bundles, and Menu component.

**Files changed:**
- `packages/themes/src/base/input.css` — select-inside-input-root structural fix
- `packages/themes/src/base/menu.css` — dropdown focus-within outline removal
- `packages/themes/src/rokkit/button.css` — danger text `z6`→`z4`
- `packages/ui/src/components/Menu.svelte` — `tabindex="-1"` on menu items
- `packages/forms/spec/input/InputText.spec.svelte.js` — regression test

**Tests:** 1073 unit tests passing.

---

## 2026-02-21

### List — Migrated to NestedController + use:navigator (ADR-003 Phase B)

Second component in Phase B (after Toggle). Replaced ~100 lines of inline keyboard navigation in List.svelte with `NestedController` + `use:navigator`.

**Key decisions:**
- Used `NestedController` (not `ListController`) because expand/collapse is handled by NestedController. Navigator handles all keyboard when `nested: collapsible`.
- Created `expandedByPath` (`$state<Record<string, boolean>>`) as reactive bridge for template rendering. Svelte 5 cannot track reactivity through `controller.lookup` ($derived Map) → `proxy.expanded` ($state). The `expandedByPath` state is the template's source of truth for expansion.
- Removed `onclick` from group label button — navigator intercepts clicks on `data-path` elements. Without this, click would double-toggle (button onclick + navigator select → handleSelectAction toggle).
- `handleSelectAction` handles both button items (fires `onselect`) and group labels (toggles expansion).
- `handleListKeyDown` only intercepts Enter/Space on link items (`<a>`) to let native navigation through.
- `handleFocusIn` syncs DOM focus → controller via `controller.moveTo(path)`.

**Expansion bridge pattern:**
1. External `expanded` prop (keyed by group name: `{ "Favorites": true }`) → `syncExpandedToController()` → controller proxy.expanded + expandedByPath
2. User toggles → `toggleGroupByKey(pathKey)` → controller.toggleExpansion + expandedByPath update → `deriveExpandedFromPath()` → expanded prop + onexpandedchange
3. Navigator toggle action → sync controller proxy states → expandedByPath → expanded prop

**E2e tests (33 total):**
- 9 flat list keyboard tests (ArrowDown/Up repeated, Home, End, no-wrap, Enter, Space, focus≠select)
- 5 grouped list keyboard tests (navigation through groups, collapse/expand, Enter toggle, repeated cycles)
- 3 mouse tests (click select, deselect, group toggle)
- 16 visual snapshots (4 themes × 2 modes × 2 states)

**Not implemented (backlog):**
- ArrowRight on expanded group → move to first child (tree-style navigation)
- ArrowLeft on child → move to parent group label

**Tests:** 1058 unit tests + 60 e2e tests (27 toggle + 33 list) all passing.

### ListController — Skip Disabled Items (Backlog #36)

Added `disabled: 'disabled'` to `@rokkit/core` defaultFields and `#isDisabled(index)` helper to `ListController`. All four movement methods (`moveNext`, `movePrev`, `moveFirst`, `moveLast`) now skip disabled items. `moveToIndex()` and `moveTo()` remain unchanged — they're used for explicit focus (focusin handler, selection) where any index should be reachable.

**Files changed:**
- `packages/core/src/constants.js` — added `disabled: 'disabled'` field
- `packages/core/spec/constants.spec.js` — updated defaultFields snapshot
- `packages/states/src/list-controller.svelte.js` — added `#isDisabled()` + updated 4 movement methods
- `packages/states/spec/list-controller.spec.svelte.js` — 7 new disabled item tests
- `sites/playground/e2e/list.spec.ts` — updated End/ArrowDown tests to verify disabled skip

**Tests:** 1065 unit tests + 60 e2e tests all passing.

### Proxy State Isolation — Controller-Owned expandedKeys

Moved expansion state from Proxy (which mutated original items via `proxy.expanded = true` → `item._expanded = true`) into a `SvelteSet` owned by the controller. Original items are no longer polluted with internal state flags when returned via `onselect`/`onchange`.

**Approach:** Added `expandedKeys = new SvelteSet()` to `ListController`. `flatVisibleNodes` now accepts an optional `expandedKeys` parameter — when provided, checks `expandedKeys.has(key)` instead of `item[fields.expanded]`. Falls back to item field for backward compat when `expandedKeys` is null. `NestedController.expand/collapse/toggleExpansion` now manipulate `expandedKeys` directly instead of `proxy.expanded`. Proxy's `expanded` setter removed; getter kept for reading initial data.

**List.svelte simplification:** Removed the `expandedByPath` reactive bridge (which was a workaround for Svelte 5 reactivity not tracking through `$derived` Map → `proxy.expanded` `$state`). Now reads `controller.expandedKeys.has(pathKey)` directly — `SvelteSet` is natively reactive.

**Files changed:**
- `packages/states/src/derive.svelte.js` — `flatVisibleNodes` accepts `expandedKeys` param
- `packages/states/src/list-controller.svelte.js` — added `expandedKeys`, `#initExpandedKeys()`
- `packages/states/src/nested-controller.svelte.js` — expand/collapse/toggle use `expandedKeys`
- `packages/states/src/proxy.svelte.js` — removed `expanded` setter
- `packages/ui/src/components/List.svelte` — removed `expandedByPath`, use `controller.expandedKeys`
- `packages/core/src/mapping.js` — added deprecation note to `isExpanded`
- Tests: updated proxy spec, added derive expandedKeys test, added nested-controller non-mutation test

**Tests:** 1068 unit tests + 60 e2e tests all passing.

---

## 2026-02-20 (session 2)

### Documentation Restructuring — Requirements Split, LLMs Reference, ADR-003

Restructured documentation per approved plan: split catch-all requirements file, created per-component requirements, built package reference docs, and wrote architecture decision for MVC separation.

**Phase 1 — Split 000-component-requirements.md:**
- Created `000-patterns.md` (type system, architecture patterns, TypeScript strategy)
- Created `000-rtl.md` (RTL detection, Vibe direction)
- Created `020-chart.md` (AnimatedChart, accessible patterns)
- Created `060-effects.md` (Tilt, Shine, Glow, Depth3D, Motion, Parallax)
- Created `080-cli.md` (CLI scaffolding, svelte-add)
- Appended TreeTable subsection to `004-table.md`
- Deleted `000-component-requirements.md`

**Phase 2 — Active component requirements (5 new files):**
- `001-button.md`, `005-select.md`, `006-menu.md`, `007-toggle.md`, `008-toolbar.md`

**Phase 3 — Archived component requirements (4 new files):**
- `009-navigation.md` (Tabs, BreadCrumbs, Stepper, PageNavigator)
- `040-layout.md` (Card, Panel, Overlay, ResponsiveGrid, Carousel, SlidingColumns)
- `050-feedback.md` (ProgressBar, Message, Pill, Separator, Summary, Icon, Link, Accordion)
- `070-data.md` (SearchFilter, Calendar)

**Phase 4 — docs/llms/ package reference (14 files + README):**
- Created `docs/llms/` with reference docs for all 14 packages
- Each doc: dependency hierarchy, exports table, key patterns, internal modules

**ADR-003 — MVC Separation (docs/decisions/003-mvc-separation.md):**
- Analysis found ~1200 lines of duplicated keyboard/navigation/focus code across List, Select, Menu, Tree
- Decision: fold composables into ui, add states/actions as ui dependencies, remove bits-ui entirely
- Found chart has dead bits-ui dependency; composables fully superseded by ui equivalents

**Backlog updated:** #28 expanded (ramda project-wide), added #29–#33 (helpers exports, chart bits-ui, ui MVC adoption, parseFilters, composables fold)

**READMEs updated:** requirements + design READMEs with expanded numbering (000–089)

---

## 2026-02-20

### Requirements & Design Documentation — List, Tree, Form

Documented requirements and design for three component areas based on existing code analysis.

**Files created:**
- `docs/requirements/002-list.md` — 10 sections, identified 4 gaps (navigator refactor, multi-selection, type-ahead, missing role="listbox")
- `docs/requirements/003-tree.md` — 12 sections, identified 6 gaps (navigator refactor, multi-selection, drag-and-drop, lazy loading, proxy recreation, search/filter)
- `docs/requirements/010-form.md` — 17 sections covering current + future features (custom type renderers, validation integration, enhanced lookups, master-detail, semantic command input, dirty tracking, form submission, audit fields)
- `docs/design/002-list.md` — Current architecture + proposed `use:navigator` + `ListDataController` refactor (~118 lines saved)
- `docs/design/003-tree.md` — Current architecture + proposed `use:navigator` + `NestedController` refactor (~54 lines saved)
- `docs/design/010-form.md` — Current architecture + 5-phase enhancement plan (FormBuilder stability, type registry, validation, lookups, master-detail, semantic command)

**Backlog updated:**
- Items #8-#16: List/Tree navigator refactor, multi-selection, lazy loading, FormBuilder recreation, legacy migration, dirty tracking, parseFilters export, type-ahead search
- Items #17-#28: Custom type renderer registry, validation integration, ValidationReport migration, InputToggle, FieldGroup, ArrayEditor, enhanced lookups, form submission, audit metadata, master-detail, semantic command input, ramda removal

**Key decisions:**
- Forms do NOT benefit from `use:navigator` — standard tab order is sufficient, arrow keys would break text inputs
- List (~100 lines inline keyboard code) and Tree (~80 lines) should be refactored to use `use:navigator` + controllers
- Form enhancement follows 5-phase strategy: fix current → type renderers → lookups/validation → master-detail → semantic command

---

## 2026-02-19

### Forms Phase 1 — Complete (Steps 1–8)

Implemented form-driven property controls via `@rokkit/forms`.

**Steps completed:**
1. Replaced `Icon` import with `<span class={icon}>` in InputField
2. Replaced InputSelect native `<select>` with `@rokkit/ui` Select component
3. Created `InfoField.svelte` for read-only value display
4. Added `info` and `separator` type dispatch in Input.svelte
5. Extended FormBuilder type resolution (options, separator, info/readonly, type at top level)
6. Handle separator elements in FormRenderer render loop
7. Exported InfoField + lib utilities from forms index
8. Pilot conversion: toggle playground page → FormRenderer with schema + layout

**Additional fixes during phase 1:**
- Changed InputCheckbox default variant to 'custom' (icon-based, not native blue checkbox)
- Moved checkbox outside `[data-input-root]` (doesn't need gradient border wrapper)
- Added `[data-input-root] [data-select] { flex-1 }` to stretch Select in input wrapper
- Created theme CSS files: `base/input.css`, `rokkit/input.css`, `minimal/input.css`
- Updated index.css files in base, rokkit, minimal to import input.css
- Added `@rokkit/forms` dependency to playground
- Wrote comprehensive `@rokkit/forms` README with future enhancements

**Commits:**
- `910499e0` — feat: form-driven property controls via @rokkit/forms

**Tests:** 1057 passing, all green

### Forms Phase 2 — Complete

Converted 8 playground pages to FormRenderer and cleaned up deprecated code.

**Page conversions (8):** list, tree, toolbar, code, floating-action, menu, select, multi-select
- Each page: replaced individual `$state()` + Prop* imports with single `props = $state({})` + schema + layout + `<FormRenderer>`
- PaletteManager skipped (uses custom snippets, not expressible as schema)

**Controls deletion:** removed `sites/playground/src/lib/controls/` (PropSelect, PropCheckbox, PropText, PropInfo, index.ts)

**Archive/deprecated cleanup:**
- Deleted `archive/forms/` (forms-old, inp, lib-deprecated, spec-inp)
- Deleted rebuilt components from `archive/ui/` (Button, List, Tree, Select, MultiSelect, Toggle, FloatingAction(s), Connector, Node, Item, NestedList + specs/snapshots)
- Deleted `packages/states/deprecated/` (hierarchy.js)
- Deleted `packages/forms/src/forms-old/`, `packages/forms/src/inp/`, `packages/forms/src/lib/deprecated/`
- Kept `archive/themes/` (reference for theme migration)
- Kept un-rebuilt components in `archive/ui/` (47 components)

**Commits:**
- `7af488f8` — feat: convert playground pages to FormRenderer and clean up deprecated code

**Tests:** 1057 passing, all green

---

### 2026-02-23 — NestedController Tree-style Navigation (Backlog #29)

Implemented WAI-ARIA treeview keyboard patterns for NestedController:
- `expand()` on already-expanded group → moves focus to first child
- `expand()` on leaf node → returns false (no children to expand)
- `collapse()` on child/leaf → moves focus to parent
- `collapse()` on root (not expanded) → returns false
- Navigator emits `'move'` event when expand/collapse changes focusedKey

**Files modified:**
- `packages/states/src/nested-controller.svelte.js` — expand/collapse with tree-style focus
- `packages/actions/src/navigator.svelte.js` — emit 'move' + scroll on focus-changing expand/collapse
- `packages/states/spec/nested-controller.spec.svelte.js` — 8 new tests

**Tests:** 1055 passing (682 UI), all green
**Backlog:** #29 done

---

### 2026-02-23 — Switch Component (iOS-style Binary Toggle)

Built new `Switch` component for `@rokkit/ui` — an iOS-style sliding toggle for binary state.

**Design:**
- Single `<button role="switch">` with track + sliding thumb
- Two options only (default `[false, true]`), also supports `['x', 'y']` or `[{icon, value}, ...]`
- ItemProxy for field mapping (same contract as Toggle/Select/List)
- Keyboard: Space/Enter toggle, ArrowRight → on, ArrowLeft → off
- No ListController/navigator needed (2 options, simple toggle)

**Files created:**
- `packages/ui/src/types/switch.ts` — SwitchProps, SwitchFields, SwitchItem types
- `packages/ui/src/components/Switch.svelte` — component
- `packages/themes/src/base/switch.css` — base structural styles (3 size variants, CSS custom property for thumb travel)
- `packages/themes/src/{rokkit,glass,material,minimal}/switch.css` — 4 theme styles
- `packages/ui/spec/Switch.spec.svelte.ts` — 27 unit tests
- `sites/playground/src/routes/components/switch/+page.svelte` — playground page

**Files modified:**
- `packages/ui/src/components/index.ts` — added Switch export
- `packages/ui/src/index.ts` — added Switch to component list
- `packages/ui/src/types/index.ts` — added switch types export
- `packages/themes/src/base/index.css` — added switch.css import
- `packages/themes/src/{rokkit,glass,material,minimal}/index.css` — added switch.css import (4 files)

**Backlog:** #1 updated (InputSwitch migration to Switch deferred), #2 removed (user decision)
**Tests:** 1055 CI + 682 UI passing, all green

---

### 2026-02-23 — InputSwitch Migration — Backlog #1 Complete

Migrated `InputSwitch.svelte` in `@rokkit/forms` from wrapping `Toggle` to wrapping `Switch`. Removed dead `handle()` function and `@rokkit/core` dependency.

**Files modified:**
- `packages/forms/src/input/InputSwitch.svelte` — replaced Toggle import with Switch

**Backlog:** #1 marked done
**Tests:** 1055 CI passing, all green

---

### 2026-02-23 — Select Typeahead Filter — Backlog #41 Complete

Added `filterable` prop to Select component. When enabled, shows a text input at the top of the dropdown for filtering options by case-insensitive substring match.

**Features:**
- `filterable` prop enables filter input in dropdown header
- `filterPlaceholder` prop (default "Search...") for custom placeholder text
- `filteredOptions` derived filters before `flatItems` — controller only sees visible items, keyboard nav works naturally
- Groups: filters children, hides groups with no matches
- Empty state ("No results") when filter has no matches
- Escape: clears filter first (with stopPropagation), closes dropdown on second press
- Filter cleared on dropdown close and after selection
- `selectedItem` searches all options (not filtered) so trigger always shows selected value

**Files modified:**
- `packages/ui/src/types/select.ts` — added `filterable`, `filterPlaceholder` to SelectBaseProps
- `packages/ui/src/components/Select.svelte` — filter state, filteredOptions derived, handleFilterKeyDown, template changes
- `packages/themes/src/base/select.css` — structural styles for filter input and empty state
- `packages/themes/src/{rokkit,glass,material,minimal}/select.css` — theme colors for filter input (4 files)
- `packages/ui/spec/Select.spec.svelte.ts` — 13 new tests in `describe('filterable')` block
- `sites/playground/src/routes/components/select/+page.svelte` — added filterable control

**Backlog:** #41 marked done
**Tests:** 1055 CI + 695 UI passing, all green

---

### 2026-02-23 — List/Tree Multi-Selection — Backlog #5 Complete

Added Ctrl+click toggle and Shift+click range selection to both List and Tree components.

**Architecture (4 layers, bottom-up):**

1. **ListController** — `#anchorKey` tracks range start, `selectRange(key)` selects all non-disabled items between anchor and target, anchor set on `select()` and `extendSelection()` but not on range (so Shift+click extends from original anchor)
2. **Navigator + kbd/utils** — new `'range'` action: `getClickAction()` detects `shiftKey`, `getKeyboardAction()` detects `Shift+Space`, `EVENT_MAP` maps range to `['move', 'select']`, handler calls `wrapper.selectRange(path)`
3. **List/Tree components** — `multiselect` prop, `selected = $bindable([])`, `onselectedchange` callback, `data-selected`/`aria-selected` on items, `data-multiselect`/`aria-multiselectable` on container
4. **CSS** — base: `user-select: none` for multiselect items; 4 themes × 2 components: selected state colors (rokkit: primary-z3/z4, glass: primary-z5/20-30, material: primary-z2, minimal: border-primary-z3/z4)

**Files modified:**
- `packages/states/src/list-controller.svelte.js` — `#anchorKey`, `selectRange()`, updated `select()`/`extendSelection()`
- `packages/actions/src/kbd.js` — `createShiftKeyboardActionMap()`, shift detection in `getKeyboardAction()`
- `packages/actions/src/utils.js` — shift detection in `getClickAction()`
- `packages/actions/src/navigator.svelte.js` — `range` in EVENT_MAP + getHandlers
- `packages/ui/src/types/list.ts` — `multiselect`, `selected`, `onselectedchange` props
- `packages/ui/src/types/tree.ts` — same props
- `packages/ui/src/components/List.svelte` — multiselect wiring, `syncSelectedFromController()`, `isItemSelected()`, template attributes
- `packages/ui/src/components/Tree.svelte` — same pattern
- `packages/themes/src/base/{list,tree}.css` — user-select: none
- `packages/themes/src/{rokkit,glass,material,minimal}/{list,tree}.css` — selected state colors (8 files)
- `packages/states/spec/list-controller.spec.svelte.js` — 8 range selection tests
- `packages/ui/spec/List.spec.svelte.ts` — 6 multi-selection tests
- `packages/ui/spec/Tree.spec.svelte.ts` — 5 multi-selection tests
- `sites/playground/src/routes/components/{list,tree}/+page.svelte` — multiselect toggle + selected display

**Backlog:** #5 marked done
**Tests:** 1075 CI + 797 UI passing, all green

---

### 2026-02-24 — Monorepo Restructure + Legacy Cleanup

**Monorepo restructure:** Moved packages/ and sites/ under `solution/` directory. Fixed tsconfig path, undeclared workspace dependencies (7 packages), husky pre-commit hook, ESLint dependencies. Commit `cbe786d0`.

**Backlog #8 (Legacy Component Migration):** Deleted broken/unused ListEditor, NestedEditor, DataEditor. Kept FieldLayout (already migrated). Stale snapshot removed.

**Backlog #25 (bits-ui in chart):** Already removed — marked done.
**Backlog #58 (Svelte 4→5 migration):** No legacy patterns remain — marked done.

---

### 2026-02-24 — Type-Ahead Search (Backlog #11)

Implemented type-ahead search for List and Tree components.

**Changes:**
- `packages/states/src/list-controller.svelte.js` — `findByText(query, startAfterKey)`: wrapping prefix search, case-insensitive, skips disabled
- `packages/actions/src/kbd.js` — added `typeahead: false` to `defaultNavigationOptions`
- `packages/actions/src/navigator.svelte.js` — type-ahead buffer + 500ms reset timer, triggers on single printable chars (no modifiers), emits 'move' action, scrolls into view, resets on navigation actions
- `packages/ui/src/components/List.svelte` — `typeahead: true` in navigator options
- `packages/ui/src/components/Tree.svelte` — `typeahead: true` in navigator options
- `packages/states/spec/list-controller.spec.svelte.js` — 7 findByText tests
- `packages/actions/spec/navigator.spec.svelte.js` — 7 typeahead tests

**Not enabled for:** Select/MultiSelect (have filter input), Menu (transient), Toolbar/Tabs/Toggle (not applicable)

**Backlog:** #11 marked done
**Tests:** 1282 CI passing, 0 lint errors

---

### 2026-02-24 — MultiSelect Value Contract Alignment (Backlog #28)

Aligned MultiSelect with the Value Binding Contract used by Select/List/Tree.

**Before:** `value: SelectItem[]`, `onchange: (items) => void`
**After:** `value: unknown[]` (extracted primitives), `selected: SelectItem[]` (bindable full items), `onchange: (values, items) => void`

**Changes:**
- `packages/ui/src/types/select.ts` — `MultiSelectProps.value: unknown[]`, added `selected: SelectItem[]`, `onchange: (values, items)`
- `packages/ui/src/components/MultiSelect.svelte` — selection logic uses extracted values via `ItemProxy.itemValue`, `isSelected` compares primitives, `toggleItemSelection`/`removeItem` emit both values and items
- `packages/ui/spec/MultiSelect.spec.svelte.ts` — all assertions updated for primitive values
- `sites/playground/.../multi-select/+page.svelte` — `value` type to `unknown[]`
- `agents/design-patterns.md` — MultiSelect row updated to "Compliant"

**Backlog:** #28 marked done
**Tests:** 1282 CI passing, 0 lint errors
