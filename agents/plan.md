# Active Plan: Navigator/Wrapper/Proxy Stack — Component Migration

**Revised architecture (2026-02-27):** Components are now built by copying the List pattern. Dropdown components (Menu, Select, MultiSelect) add a `Trigger` class from `@rokkit/actions` for open/close management. Toggle uses horizontal Navigator. Tree uses collapsible Navigator + tree-line helper.

## Phase 1: List — COMPLETE

- `@rokkit/core`: constants UPPER_SNAKE_CASE, `resolveSnippet` added
- `@rokkit/actions`: `Navigator` class + `buildKeymap` + `resolveAction` + `ACTIONS`
- `@rokkit/states`: `AbstractWrapper` + `ProxyItem` + `Wrapper` + `buildProxyList/buildFlatView`
- `@rokkit/ui/List.svelte`: fully rewritten
- Learn site List docs: 8 examples, play page, e2e tests, llms.txt
- Design patterns documented, migration backlog added (#65-#69)
- SimplifiedList removed

**Tests:** 1600 passing, lint 0 errors, build ✓

## Phase 2: Select — backlog #65 — COMPLETE

- [x] Rewrite `Select.svelte` with `Wrapper` + `Navigator` class, add `class` prop
- [x] Update learn site `elements/select/+page.svelte` (improved examples)
- [x] Add playground page `elements/select/play/+page.svelte` + `+layout.svelte`
- [x] Update `llms.txt` for Select
- [x] Add e2e tests `sites/learn/e2e/select.spec.ts`
- [x] `bun run test:ci` + `bun run lint` — 0 errors, build ✓

## Phase 3: Toggle — backlog #68 — IN PROGRESS

**New approach:** Copy List pattern. Horizontal Navigator. External value sync.

- [x] Add `raw` getter to `ProxyItem` in `@rokkit/states`
- [x] Rewrite `Toggle.svelte` using `wrapper.flatView` loop, `resolveSnippet`, horizontal Navigator
- [x] `bun run test:ci` 1600 pass, lint 0 errors
- [ ] Update `toggle.ts` types if needed
- [ ] Update learn site `elements/toggle/+page.svelte` with examples
- [ ] Add playground page `elements/toggle/play/+page.svelte` + `+layout.svelte`
- [ ] Create `llms.txt` for Toggle
- [ ] Commit, wait for confirmation → proceed to Menu

## Phase 4: Menu — backlog #67

**New approach:** List pattern + `Trigger` class (open/close management).

- [x] `raw` getter on ProxyItem (done in Phase 3)
- [ ] Create `Trigger` class in `packages/actions/src/trigger.svelte.js`
- [ ] Export `Trigger` from `packages/actions/src/index.js`
- [ ] Rewrite `Menu.svelte` using List pattern + `renderNodes` for groups + `Trigger`
- [ ] Update learn site `elements/menu/+page.svelte` + examples
- [ ] Create `llms.txt` for Menu
- [ ] `bun run test:ci` + lint — 0 errors, build ✓
- [ ] Commit, wait for confirmation → proceed to Tree

## Phase 5: Tree — backlog #69

**New approach:** Copy List. Add tree-line helper. Collapsible Navigator.

- [ ] Write `getTreeLineType(node, index, nodes)` helper
- [ ] Rewrite `Tree.svelte` using List pattern + tree-line rendering
- [ ] Update learn site + tree story
- [ ] Create `llms.txt` for Tree
- [ ] Commit, wait for confirmation → proceed to MultiSelect

## Phase 6: MultiSelect + FilteredWrapper — backlog #66

- [ ] Create `FilteredWrapper extends Wrapper` subclass in `@rokkit/states`
- [ ] Rewrite `MultiSelect.svelte` with `Wrapper`/`FilteredWrapper` + `Navigator` class
- [ ] Revisit `Select.svelte` to use `FilteredWrapper` for cleaner filtering
- [ ] Commit, wait for confirmation

---

# Previous Plan: Effects & Visual Enhancements

## ~~Phase 1: Reveal Effect (backlog #52)~~ COMPLETE

`use:reveal` action + `Reveal` wrapper component. IntersectionObserver-based scroll-triggered entry animations with stagger support. 22 action tests + 16 component tests. Playground page.

## ~~Phase 2: FloatingNavigation (backlog #50)~~ COMPLETE

`FloatingNavigation.svelte` — 4-position layouts, hover expand, pin toggle, IntersectionObserver, CSS animations, keyboard nav. 34 tests + playground page. Base + 4 theme CSS.

## ~~Phase 3: Button Style Enhancements (backlog #51)~~ COMPLETE

`gradient` + `link` style variants. Micro-animations (hover lift, press, icon shift, loading pulse). Glass/minimal/material button theme CSS created. Playground updated.

## ~~Phase 4: HoverLift/Magnetic/Ripple Actions (backlog #53)~~ COMPLETE

Three effect actions in `@rokkit/actions`: `use:hoverLift` (translateY + shadow), `use:magnetic` (cursor attraction), `use:ripple` (click ripple). All respect `prefers-reduced-motion`. 36 tests.

## ~~Phase 5: Learn/Play Integration~~ COMPLETE

URL-routed play pages for List, Select, Tabs. Toggle header in per-component layouts. FileTabs rewritten to use `Tabs` from `@rokkit/ui`. PlaySection.svelte created. (learn) layout fixed for `/play` sub-routes. 1356 tests pass.

## Phase 6: Next Priority Items

Candidates (by priority):
- **#47** Table Phase 2–4 (Medium) — hierarchy, pagination, polish

---

## Previous Plan: Component Migration + Learn Site Update

### ~~Phase 1: Migrate Missing Components (backlog #44, #45)~~ COMPLETE

Both Pill (16 tests) and Rating (26 tests) migrated to Svelte 5. All 626 UI tests and 1047 CI tests pass. Exports, base CSS, playground pages, nav entries, and LLM docs updated.

## Phase 2: Learn Site Story Audit & Update (backlog #46)

### ~~2a. Fix Build + Infrastructure~~ COMPLETE

Fixed all broken imports. Learn site builds successfully.
- Fixed `uno.config.js` (import from `@rokkit/core` not `@rokkit/themes`)
- Fixed `ThemeSwitcher.svelte` (`ThemeSwitcherToggle` from `@rokkit/app`)
- Fixed `Connector` missing from `@rokkit/ui` barrel export
- Replaced `Icon` with CSS class spans in shared components
- Replaced `Switch` with `Toggle` in tabs orientation
- Removed `Item` import from pill/list stories
- Converted broken story routes to ComingSoon placeholders
- Added `collapsible` to Sidebar List

### ~~2b. Create New Stories~~ COMPLETE

- [x] `elements/toggle` — Toggle component story
- [x] `elements/toolbar` — Toolbar component story
- [x] `elements/menu` — Menu component story
- [x] `elements/carousel` — Carousel component story (intro + transitions)
- [x] `primitives/card` — Card story (replaced ComingSoon)
- [x] `primitives/button` — Button story (replaced ComingSoon)
- [x] `elements/breadcrumbs` — BreadCrumbs story
- [x] `primitives/code` — Code component story (new route)
- [x] `layout/progress` — ProgressBar story (replaced ComingSoon)
- [x] `primitives/pill` — Pill story (text update)
- [x] `input/rating` — Rating story (fixed broken HTML, heading levels)
- [x] `elements/list` — added nested/collapsible groups example
- [x] Add breadcrumb computation to `(learn)/+layout.svelte`
- [x] Review `elements/select`, `elements/multi-select`, `elements/tabs` — fixed broken `<section>` tags in Select/MultiSelect, updated dead links (DropDown→Menu, Switch→Toggle). Tabs was clean.

### 2c. Deferred
- Tree story, FloatingAction story, effects stories (Tilt, Shine)
- ~~Stepper story~~ DONE (#38 complete)
- Input stories: Calendar, Range (when components exist)
- Playground integration into learn site
- Table story (when #47 is done)

## Component Status Reference

| Component | In @rokkit/ui? | Learn Site Status | Action |
|-----------|---------------|-------------------|--------|
| List | YES | Has story (updated) | DONE |
| Tree | YES | Coming Soon | Create story (deferred) |
| Select | YES | Has story | Review |
| MultiSelect | YES | Has story | Review |
| Tabs | YES | Has story | Review |
| Toggle | YES | Has story | DONE |
| Toolbar | YES | Has story | DONE |
| Menu | YES | Has story | DONE |
| Button | YES | Has story | DONE |
| BreadCrumbs | YES | Has story | DONE |
| Card | YES | Has story | DONE |
| ProgressBar | YES | Has story | DONE |
| Carousel | YES | Has story | DONE |
| Code | YES | Has story | DONE |
| Connector | YES | Has story | OK |
| Pill | YES | Has story (updated) | DONE |
| Rating | YES | Has story (updated) | DONE |
| Tilt | YES | Missing | Defer |
| Shine | YES | Missing | Defer |
| FloatingAction | YES | Missing | Defer |
| Accordion | ComingSoon | Placeholder | Rebuild when ready |
| Table | ComingSoon (#47) | Placeholder | Rebuild when implemented |
| Icon | ComingSoon | Placeholder | Rebuild when ready |
| Item | ComingSoon | Placeholder | Rebuild when ready |
| Calendar | ComingSoon | Placeholder | Rebuild when implemented |
| Range | ComingSoon (#48) | Placeholder | Rebuild when implemented |
| Stepper | YES | Has story | DONE |
