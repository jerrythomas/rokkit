# Four published `*Props` types describe components that no longer exist

**Raised:** 2026-09-14, while typing snippet props.
**Status:** CLOSED 2026-09-14 — corrected to match the components, and every
component now annotates `$props()` with its own declared type.

## The defect

`@rokkit/ui` publishes a props interface per component. For four of them the
interface and the component had drifted, and nothing caught it because **the
component never imported its own props type** — there was no cross-check between
the declared shape and the real `$props()`.

`ListProps` was the clearest case:

| `ListProps` said | `List.svelte` actually had |
| --- | --- |
| `item?: ListItemSnippet` — `(item, fields, handlers, isActive)` | `itemContent` — `(proxy)` |
| `groupLabel?: ListGroupLabelSnippet` | `groupContent` — `(proxy)` |
| `multiselect`, `expanded`, `selected`, `active` | *(absent)* |
| `onselectedchange`, `onexpandedchange` | *(absent)* |
| `onselect?: (value, item: ListItem)` | `onselect?: (value, proxy: ProxyItem)` |

`TreeProps` was worse (also `expandAll`, `ontoggle`, `onloadchildren`, and
`item`/`toggle`/`connector` snippets). `SelectBaseProps` named the data prop
`options` when every component in that family takes `items`.

## The resolution

Direction taken: **the component is the truth.** Each interface was rewritten to
match its component, and the component now annotates `$props()` with it — so any
future drift is a compile error rather than a silent lie.

Nine components were wired, covering both the stale four and five that had no
declared type at all:

| Component | Change |
| --- | --- |
| List, Menu, Tree, Select, MultiSelect | interface corrected, then wired |
| Grid, CommandPalette, Dropdown, LazyTree | interface written (`grid.ts`, `command-palette.ts`, `DropdownProps`, `LazyTreeProps`), then wired |

Also removed, as they described snippet/handler APIs no component accepts:
`ListItemSnippet`, `ListGroupLabelSnippet`, `ListItemHandlers`,
`TreeItemSnippet`, `TreeToggleSnippet`, `TreeConnectorSnippet`,
`TreeItemHandlers`, `SelectOptionSnippet`, `SelectGroupLabelSnippet`,
`SelectValueSnippet`, `MultiSelectValueSnippet`, `SelectItemHandlers`. All were
unused outside their own files.

Duplicate icon interfaces declared inside components (`ListIcons`, `MenuIcons`,
`SelectIcons`, `MultiSelectIcons`, `DropdownIcons`) were dropped in favour of
the existing `ListStateIcons` / `MenuStateIcons` / `SelectStateIcons`.

## The guard

Wiring stops *drift*, but a **new** component could still be added with an
inline type — which no type checker can notice. `spec/props-types.spec.ts`
enforces both halves for all 62 components:

1. the component references its own `<Name>Props`, and
2. that type is declared in `src/types/`, not inline.

It found one case immediately that the manual survey had passed: `Swatch`
declared `SwatchProps` **inline**, so it satisfied (1) and failed (2). Moved to
`types/swatch.ts`.

Break-it verified: unwiring `Grid` fails the spec. The suite also asserts it
found >50 components, so a bad glob can't make every case vacuous.

## Note for whoever touches this next

`check:types` on `packages/ui` alone would **not** have caught the original
drift, and still wouldn't catch a similar consumer-facing break — only a
consumer does. Keep `apps/learn` in the gate.
