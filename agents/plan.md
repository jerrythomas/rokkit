# Active Plan: Effects & Visual Enhancements

## ~~Phase 1: Reveal Effect (backlog #52)~~ COMPLETE

`use:reveal` action + `Reveal` wrapper component. IntersectionObserver-based scroll-triggered entry animations with stagger support. 22 action tests + 16 component tests. Playground page.

## Phase 2: Next Priority Items

Candidates (by priority):
- **#50** FloatingNavigation (Medium) — design doc ready
- **#51** Button style enhancements (Medium) — gradient/link variants + micro-animations
- **#53** HoverLift/Magnetic/Ripple actions (Medium) — small scope each
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
