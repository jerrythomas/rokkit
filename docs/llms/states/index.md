# @rokkit/states — Overview

> Svelte 5 state management: field-mapped item proxy, list/tree controllers, global theme (Vibe), and localization (Messages).

**Package**: `@rokkit/states`
**Depends on**: `@rokkit/core`, `d3-array`, `@lukeed/uuid`, `ramda`, `svelte`

## Exports

| Export | File | Description |
|--------|------|-------------|
| [ListController](list-controller.md) | `list-controller.svelte.js` | Flat list navigation, selection, focus |
| [NestedController](nested-controller.md) | nested-controller.svelte.js | Hierarchical navigation + expand/collapse |
| [Proxy](proxy.md) | `proxy.svelte.js` | Reactive field-mapped item wrapper |
| [vibe](vibe.md) | `vibe.svelte.js` | Global theme/appearance singleton |
| [messages](messages.md) | `messages.svelte.js` | Global localization singleton |
| `TableWrapper` | `table-controller.svelte.js` | Basic tabular data wrapper |

## Design Principles

- **Reactive**: All state uses Svelte 5 `$state` and `$derived` runes.
- **Field-mapped**: Controllers accept a `fields` object to map custom property names.
- **Controller/navigator separation**: Controllers manage state; `navigator` action handles DOM events.
- **No DOM access**: Controllers are pure JS classes — no DOM knowledge.

## Internal Modules

| Module | Purpose |
|--------|---------|
| `derive.svelte.js` | `deriveLookupWithProxy()`, `flatVisibleNodes()` — shared derivation helpers |
| `traversal.svelte.js` | Tree traversal utilities |
| `constants.js` | `VALID_MODES`, `VALID_DENSITIES`, `DEFAULT_STYLES` |
