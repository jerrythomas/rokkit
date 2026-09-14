# Snippet props are untyped across the component surface

**Raised:** 2026-09-14, while adding `apps/learn` to `check:svelte`.
**Status:** CLOSED 2026-09-14 — documented snippets typed; one larger finding
split out (see below).

## The gap

The item-rendering components collected their snippets with a rest element
behind an index signature:

```svelte
let { items = [], /* … */, ...snippets }: {
    /* … typed props … */
    [key: string]: unknown
} = $props()
```

So `itemContent` was `unknown`, and every consumer's snippet parameter arrived
implicitly `any`:

    Parameter 'proxy' implicitly has an 'any' type.

The index signature exists for a real reason — an item can name its own snippet
(`item.snippet = 'name'`, resolved by `resolveSnippet`), so arbitrary keys must
stay accepted. But the *documented* snippets are a closed set and can be
declared alongside it: TypeScript prefers an explicit member over the index
signature, so the common case is checked and named snippets still work.

## What was done

`packages/ui/src/types/snippets.ts` introduces the shared vocabulary, exported
from the package:

- `ItemSnippet` = `Snippet<[ProxyItem]>` — `itemContent` / `groupContent`
- `SelectableItemSnippet` = `Snippet<[ProxyItem, boolean]>`
- `ItemSnippets` — the bag, for spreading into a props type

Applied uniformly after surveying how each component actually calls its snippet,
rather than assuming one shape:

| Shape | Components |
| --- | --- |
| `content(proxy)` | Grid, LazyTree, List, Menu, MultiSelect, Select, Tree |
| `content(proxy, selected)` | Tabs, Toggle |

Not changed: `UploadProgress` (already typed via `UploadItemSnippet`),
`UploadTarget` (`content(dragging)` — not an item snippet), and
`FloatingAction` / `Toolbar`, whose custom snippets take
`(original, fields, handlers)` and are a different concept.

## Verification

Red/green through the consumer-side gate, which is what made this visible:

1. Stripped the two interim annotations in learn → `svelte-check` reported 2
   implicit-`any` errors.
2. Typed the library → 0 errors with the annotations still removed.
3. Proved the green is not vacuous: assigning the parameter to `number` yields
   *"Type 'ProxyItem' is not assignable to type 'number'"* — it is genuinely
   inferred, not `any` again.

The interim annotations and the now-unused `ProxyItem` import in
`theme-wizard/index.svelte` are gone.

## Split out: four published props types describe components that don't exist

Found while doing this, and **larger than the original item** — booked
separately in `2026-09-14-stale-props-types.md`.

`types/list.ts` exports a full `ListProps`, but `List.svelte` never imports it,
and they have drifted: `ListProps` advertises `item` / `groupLabel` snippets,
`multiselect`, `expanded`, `selected` and `active` — none of which the component
reads — and types `onselect` as `(value, item: ListItem)` when the component
passes a `ProxyItem`.

44 of 48 `*Props` interfaces *are* wired to their component. The four that are
not — `ListProps`, `MenuProps`, `SelectBaseProps`, `TreeProps` — are exactly the
ones free to drift, because nothing cross-checks a declared type against the
component's real `$props()`.
