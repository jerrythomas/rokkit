# List multi-select (#153, the step before Phase 2)

**Status:** DONE (2026-10-01). See journal 2026-10-01 (5).
**Packages:** `@rokkit/states` (Wrapper), `@rokkit/ui` (List), learn (List demo)

## Why

#153's audit found the five themes' `[data-list-item][data-selected]` rules dead: List never
emits `data-selected`. The user chose to make them live by adding multi-select to List,
rather than delete them.

## What already exists

- **`Wrapper`** (`84b42070d`), `multiselect: true`:
  - `select()` replaces the set with one item;
  - `extend()` toggles an item and sets the anchor;
  - `range()` selects from the anchor;
  - `selectedKeys` and `selected` read the set.
- **The navigator** sends `extend` on Ctrl/⌘ and `range` on Shift, for click and Space.
- **The themes** style `[data-list-item][data-selected='true']` in every style.

## Gaps, and decisions

- **Inbound.** Nothing can set the selection from outside. `Wrapper.moveToValues(values)`
  selects the leaves whose value is in `values`, by identity, the way `moveToValue` matches
  one.
- **Outbound.** There is no callback for the set. An `onselectionchange(values)` option fires
  whenever the set changes, through select, extend or range. It does not fire when the set
  is unchanged, or when the change came in through `moveToValues`.
- **Ranges keep leaves only.** A range currently sweeps group headers into `selectedKeys`,
  and a group is not a selectable value.
- **List** gains:
  - `multiselect` (default `false`, so single-select is unchanged);
  - a bindable `values` (default `[]`);
  - `onchange(values)`.
- **Selected items** carry `data-selected="true"` (the value the theme rules target) and
  `aria-pressed`. `value` and `data-active` keep meaning the last-activated item.
- **Docs.** The List demo gains a multi-select variant (the live doc page), with an e2e.

## Slices (test first)

1. Wrapper: `moveToValues`, `onselectionchange`, leaves-only ranges.
2. List: the props, `data-selected`, inbound and outbound, plus specs.
3. The learn variant, e2e, docs. Then #153 Phase 2 (List onto the state tokens) can proceed.
