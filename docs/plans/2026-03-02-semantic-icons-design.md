# Semantic Icons — Design Document

**Backlog:** #63 — Fix Hardcoded Icon Strings in Components
**Date:** 2026-03-02

## Goal

Eliminate all hardcoded `i-lucide:*` icon strings from components, making every icon default sourced from `DEFAULT_STATE_ICONS` and overridable via the standard `icons` prop pattern.

## Decisions

1. **Standardize all components to `icons` object prop** — same pattern as Menu/Select/List
2. **Breaking changes accepted** — no consumers yet, clean API over backward compat
3. **Mixed icon grouping (Approach C)** — generic actions in `action` group, palette-specific in new `palette` group
4. **Solar icon set** as SVG source — consistent with existing icons

## New Icons

### Action group additions (4)

| Icon name | SVG file | Used by |
|-----------|----------|---------|
| `action-check` | `action-check.svg` | Stepper (completed step), PaletteManager (save confirm) |
| `action-save` | `action-save.svg` | PaletteManager (save button) |
| `action-pin` | `action-pin.svg` | FloatingNavigation (pinned) |
| `action-unpin` | `action-unpin.svg` | FloatingNavigation (unpinned) |

### New palette group (2)

| Icon name | SVG file | Used by |
|-----------|----------|---------|
| `palette-presets` | `palette-presets.svg` | PaletteManager (preset selector toggle) |
| `palette-hex` | `palette-hex.svg` | PaletteManager (hex input toggle) |

**Files:**
- `packages/icons/src/base/` — 6 new SVG files
- `packages/core/src/constants.js` — add 6 names to `DEFAULT_ICONS`
- `packages/core/spec/constants.spec.js` — update count/snapshot

## Component Migrations

All 7 components standardized to `icons` object prop with `DEFAULT_STATE_ICONS` defaults.

### Pattern

```js
// Props
icons: userIcons = {}

// Merged (same as Menu/Select/List)
const icons = $derived({ ...DEFAULT_STATE_ICONS.rating, ...userIcons })

// Template
<span class={icons.filled} aria-hidden="true"></span>
```

### Migration table

| Component | Icons group | Keys | Replaces |
|-----------|------------|------|----------|
| Rating | `rating` | `filled`, `empty`, `half` | `filledIcon`, `emptyIcon` props removed |
| Stepper | `action` | `check` | `icons.completed` renamed to `icons.check` |
| FloatingAction | `action` | `add`, `close` | `icon`, `closeIcon` props removed |
| Pill | `action` | `remove` | Hardcoded `i-lucide:x` |
| BreadCrumbs | `navigate` | `right` | `separator` prop removed |
| FloatingNavigation | `action` | `pin`, `unpin` | Hardcoded `i-lucide:pin`/`pin-off` |
| PaletteManager | `action` + `palette` | `save`, `check`, `presets`, `hex` | 4 hardcoded `i-lucide:*` |

### Breaking prop changes

- **Rating**: `filledIcon`/`emptyIcon` removed → use `icons={{ filled: '...', empty: '...' }}`
- **FloatingAction**: `icon`/`closeIcon` removed → use `icons={{ add: '...', close: '...' }}`
- **BreadCrumbs**: `separator` removed → use `icons={{ right: '...' }}`

### Type updates

Each component gets a typed icons interface:
- `RatingIcons { filled?, empty?, half? }`
- `FloatingActionIcons { add?, close? }`
- `BreadCrumbsIcons { right? }`
- `PillIcons { remove? }`
- `FloatingNavigationIcons { pin?, unpin? }`
- `PaletteManagerIcons { save?, check?, presets?, hex? }`
- Stepper already has `StepperIcons` — rename `completed` to `check`

## Affected Files

### Core
- `packages/core/src/constants.js`
- `packages/core/spec/constants.spec.js`

### Icons
- `packages/icons/src/base/` (6 new SVGs)

### Components
- `packages/ui/src/components/Rating.svelte`
- `packages/ui/src/components/Stepper.svelte`
- `packages/ui/src/components/FloatingAction.svelte`
- `packages/ui/src/components/Pill.svelte`
- `packages/ui/src/components/BreadCrumbs.svelte`
- `packages/ui/src/components/FloatingNavigation.svelte`
- `packages/ui/src/components/PaletteManager.svelte`

### Types
- `packages/ui/src/types/rating.ts`
- `packages/ui/src/types/stepper.ts`
- `packages/ui/src/types/floating-action.ts`
- `packages/ui/src/types/pill.ts`
- `packages/ui/src/types/breadcrumbs.ts`
- `packages/ui/src/types/floating-navigation.ts`
- `packages/ui/src/types/palette.ts`

### Tests
- All 7 component spec files — verify default icons render + custom overrides
