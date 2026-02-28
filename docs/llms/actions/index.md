# @rokkit/actions — Overview

> Svelte 5 actions for keyboard navigation, gestures, theming, and visual effects.

**Package**: `@rokkit/actions`
**Depends on**: `@rokkit/core`, `ramda`

## Action Catalog

### Navigation

| Action | File | Purpose |
|--------|------|---------|
| [navigator](navigator.md) | `navigator.svelte.js` | Full keyboard + click navigation, requires Controller |
| [keyboard](keyboard.md) | `keyboard.svelte.js` | Key → custom event mapping |
| [navigable](navigable.md) | `navigable.svelte.js` | Simple directional events without controller |
| [dismissable](dismissable.md) | `dismissable.svelte.js` | Click-outside / Escape close |

### Gestures

| Action | File | Purpose |
|--------|------|---------|
| [swipeable](swipeable.md) | `swipeable.svelte.js` | Touch/mouse swipe |
| [pannable](pannable.md) | `pannable.svelte.js` | Drag/pan with coordinates |

### Visual Effects

| Action | File | Purpose |
|--------|------|---------|
| [reveal](reveal.md) | `reveal.svelte.js` | Scroll-triggered entry animation |
| [hoverLift](hover-lift.md) | `hover-lift.svelte.js` | Elevation on hover |
| [magnetic](magnetic.md) | `magnetic.svelte.js` | Cursor-tracking displacement |
| [ripple](ripple.md) | `ripple.svelte.js` | Material click ripple |

### Theming / DOM

| Action | File | Purpose |
|--------|------|---------|
| [themable](themable.md) | `themable.svelte.js` | Apply theme data-attributes + localStorage |
| [skinnable](skinnable.md) | `skinnable.svelte.js` | Apply CSS variables inline |

## Key Design Rules

1. **All actions use `$effect`** — reactive to option changes, cleanup on destroy.
2. **All visual effect actions respect `prefers-reduced-motion`** — skip or immediately show on reduced motion.
3. **`navigator` intercepts all clicks on `[data-path]` elements** — do NOT add `onclick` on those elements.
4. **Actions emit typed custom events** — listen with `on:eventName` or `addEventListener`.

## Internal Modules

| Module | Purpose |
|--------|---------|
| `kbd.js` | `getKeyboardAction()`, key → action mapping, typeahead buffer |
| `utils.js` | `getClosestAncestorWithAttribute()`, `getPathFromEvent()` |
| `lib/event-manager.js` | `EventManager()` — lifecycle-safe event listener management |
| `types.js` | TypeScript type definitions for controller interface |
