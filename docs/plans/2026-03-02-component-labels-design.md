# Component Labels — Translatable Strings via MessagesStore — Design Document

**Backlog:** #64 — Component Labels — Translatable Strings via MessagesStore
**Date:** 2026-03-02

## Goal

Replace all hardcoded English strings (aria-labels, button labels, state text) in UI components with `MessagesStore` defaults, enabling app-global i18n via `messages.set()` and per-instance overrides via `labels` prop.

## Decisions

1. **Same pattern as icons** — component defaults read from `messages.current.<component>`, user overrides via `labels` prop spread on top
2. **Two patterns by string count** — single-label components use existing `label` prop with store default; multi-label components use `labels` object prop merged over store
3. **Deep-merge in `set()`** — so `messages.set({ tree: { expand: 'Ouvrir' } })` preserves all other tree keys
4. **All 15 components in one pass** — including ThemeSwitcherToggle in `@rokkit/app`
5. **Breaking changes accepted** — no consumers yet

## MessagesStore Changes

### Extended defaultMessages

```js
const defaultMessages = {
  // existing flat keys (unchanged)
  emptyList: 'No items found',
  emptyTree: 'No data available',
  loading: 'Loading...',
  noResults: 'No results found',
  select: 'Select an option',
  search: 'Search...',
  // new — component labels (nested)
  list:         { label: 'List' },
  tree:         { label: 'Tree', expand: 'Expand', collapse: 'Collapse', loading: 'Loading', loadMore: 'Load More' },
  toolbar:      { label: 'Toolbar' },
  menu:         { label: 'Menu' },
  toggle:       { label: 'Selection' },
  rating:       { label: 'Rating' },
  stepper:      { label: 'Progress' },
  breadcrumbs:  { label: 'Breadcrumb' },
  carousel:     { label: 'Carousel', prev: 'Previous slide', next: 'Next slide', slides: 'Slide navigation' },
  tabs:         { add: 'Add tab', remove: 'Remove tab' },
  code:         { copy: 'Copy code', copied: 'Copied!' },
  range:        { lower: 'Lower bound', upper: 'Upper bound', value: 'Value' },
  search_:      { clear: 'Clear search' },
  filter:       { remove: 'Remove filter' },
  floatingNav:  { pin: 'Pin navigation', unpin: 'Unpin navigation' },
  mode:         { system: 'System', light: 'Light', dark: 'Dark' }
}
```

### Deep-merge in set()

```js
set(custom) {
  const merged = { ...defaultMessages }
  for (const key of Object.keys(custom)) {
    if (typeof custom[key] === 'object' && custom[key] !== null && typeof merged[key] === 'object' && merged[key] !== null) {
      merged[key] = { ...merged[key], ...custom[key] }
    } else {
      merged[key] = custom[key]
    }
  }
  this.#messages = merged
}
```

## Component Migration Patterns

### Multi-label components (labels prop)

```svelte
<script>
  import { messages } from '@rokkit/states'
  let { labels: userLabels = {} } = $props()
  const labels = $derived({ ...messages.current.tree, ...userLabels })
</script>
<div aria-label={labels.label}>
  <button>{labels.expand}</button>
</div>
```

### Single-label components (label prop)

```svelte
<script>
  import { messages } from '@rokkit/states'
  let { label = messages.current.list.label } = $props()
</script>
<div aria-label={label}>
```

### ThemeSwitcherToggle (buildThemeSwitcherOptions)

```ts
export function buildThemeSwitcherOptions(icons, labels) {
  return [
    { value: 'system', text: labels.system, icon: icons.system },
    { value: 'light', text: labels.light, icon: icons.light },
    { value: 'dark', text: labels.dark, icon: icons.dark }
  ]
}
```

## Component Mapping

| Component | Pattern | Store key | Label keys |
|-----------|---------|-----------|------------|
| List | `label` prop | `list` | `label` |
| Tree | `labels` prop | `tree` | `label`, `expand`, `collapse`, `loading`, `loadMore` |
| LazyTree | `labels` prop | `tree` | `label`, `expand`, `collapse`, `loading`, `loadMore` |
| Toolbar | `label` prop | `toolbar` | `label` |
| Menu | `label` prop (existing) | `menu` | `label` |
| Toggle | `label` prop | `toggle` | `label` |
| Rating | `label` prop | `rating` | `label` |
| Stepper | `label` prop | `stepper` | `label` |
| BreadCrumbs | `label` prop | `breadcrumbs` | `label` |
| Carousel | `labels` prop | `carousel` | `label`, `prev`, `next`, `slides` |
| Tabs | `labels` prop | `tabs` | `add`, `remove` |
| Code | `labels` prop | `code` | `copy`, `copied` |
| Range | `labels` prop | `range` | `lower`, `upper`, `value` |
| SearchFilter | `labels` prop | `search_` + `filter` | `clear`, `remove` |
| FloatingNavigation | `labels` prop + `label` (existing) | `floatingNav` | `pin`, `unpin` |
| ThemeSwitcherToggle | `buildThemeSwitcherOptions()` | `mode` | `system`, `light`, `dark` |

## Affected Files

### States package
- `packages/states/src/messages.svelte.js` — extend defaultMessages, deep-merge set()
- `packages/states/spec/messages.spec.js` — test deep-merge, new keys

### UI components (15 + LazyTree = 16 files)
- `packages/ui/src/components/List.svelte`
- `packages/ui/src/components/Tree.svelte`
- `packages/ui/src/components/LazyTree.svelte`
- `packages/ui/src/components/Toolbar.svelte`
- `packages/ui/src/components/Menu.svelte`
- `packages/ui/src/components/Toggle.svelte`
- `packages/ui/src/components/Rating.svelte`
- `packages/ui/src/components/Stepper.svelte`
- `packages/ui/src/components/BreadCrumbs.svelte`
- `packages/ui/src/components/Carousel.svelte`
- `packages/ui/src/components/Tabs.svelte`
- `packages/ui/src/components/Code.svelte`
- `packages/ui/src/components/Range.svelte`
- `packages/ui/src/components/SearchFilter.svelte`
- `packages/ui/src/components/FloatingNavigation.svelte`

### App package
- `packages/app/src/types/theme-switcher.ts` — buildThemeSwitcherOptions() reads messages.current.mode
- `packages/app/src/components/ThemeSwitcherToggle.svelte` — pass labels to builder

### Tests
- All 15+ component spec files — verify default labels + custom overrides
