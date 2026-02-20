# Project Journal

Chronological log of confirmations, progress, milestones, and decisions.
Design details live in `docs/design/` — modular docs per module.

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
