# Select decomposition

**Status:** IMPLEMENT (2026-09-30). The user said "after these start picking up open issues from #165"; this is one of "these".
**Package:** `@rokkit/ui`

## Why

`components/Select.svelte` is the top UI hotspot: 501 lines and complexity 100. Its script mixes
component wiring with pure computations:

- filtering items and groups;
- forcing groups into non-navigable labels;
- the group-divider set;
- the selected value's key;
- fixed-position dropdown placement;
- a hand copy of the Navigator's focus-and-in-root scroll.

`MultiSelect.svelte` copies the group labels and the dividers. Its own focus effect calls
`focus()` without `preventScroll`, then `scrollIntoView`, and both scroll every scrollable
ancestor. Select removed exactly that effect because it caused page scroll on arrow keys and
layout shift on reopen.

## Shape

| Part | Owns |
|---|---|
| `utils/dropdown.ts` (pure) | `filterItems`, `groupsAsLabels`, `groupDividerKeys`, `valueKey`, `dropdownPlacement` |
| `@rokkit/actions` `focusItem` | now exported: focus an item without scrolling ancestors, then scroll within the root |

Select and MultiSelect keep their props, markup and data attributes.

## Slices (test first)

1. `utils/dropdown.ts` + spec. Select and MultiSelect adopt it.
2. Export `focusItem`. Select uses it in place of its copy. MultiSelect's focus effect uses it,
   which fixes the ancestor scroll; a test pins `preventScroll` and no `scrollIntoView`.
3. Re-measure, docs, journal.

Invariants: the Select / MultiSelect specs pass unchanged, and so do the Select browser specs
and learn e2e; lint 0/0; svelte-check.

Not in scope, noted: MultiSelect has none of Select's fixed positioning or `maxRows`, so inside
an `overflow` container it clips. That's a feature-parity change with CSS consequences.
