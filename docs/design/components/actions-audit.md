# Actions / Controllers — Audit

**Date:** 2026-06-03
**Status:** Audit complete (investigation only — no code changes)
**Backlog item:** `docs/backlog/2026-05-20-actions-controllers-simplification-investigation.md`

## TL;DR

Two parallel implementations live side by side. The ADR-003 migration replaced the old action/controller stack for **11 of 13 list-shaped components**; **Toolbar and Table are the only stragglers** still using the old code. The simplification work the backlog item asks about is **mostly done** — what remains is a finite migration plus deletion of `~803` lines of leftover source plus their tests.

The right shape of the recommendation:

1. Migrate `Toolbar.svelte` and `Table.svelte` to `Wrapper + Navigator class` (the Table refactor is already scoped as Tree-Table Part A in `docs/backlog/2026-05-22-tree-table-and-table-simplification.md`).
2. Delete the old action `navigator.svelte.js`, the `ListController`, and the `TableController`. Remove the corresponding exports from `@rokkit/actions` and `@rokkit/states`.
3. Delete the unused `Traversal` class (no consumers, not exported from `@rokkit/states`).
4. Leave the rest of `@rokkit/actions` (`navigable`, `delegateKeyboardEvents`, etc.) alone — they're independent of the list-navigation stack and serve different consumers.

No new abstraction (no `useListNavigation(items)` spike) is needed. The current `Wrapper + Navigator` split is right-sized — the issue was never the architecture, only the half-finished migration.

---

## Background — what changed under ADR-003

Pre-ADR-003, list-shaped components used a Svelte **action** (`use:navigator={{ wrapper: controller, ... }}`) that fired `CustomEvent('action', { detail: { name, data } })` for every interaction. Components subscribed via `addEventListener('action', onAction)` and re-implemented focus/scroll on top.

ADR-003 replaced this with a **class** `Navigator(root, wrapper, options)` that calls `wrapper[action](path)` directly. The `Wrapper` class owns navigation state (focusedKey, expanded, selection) on top of a `ProxyTree` data layer. No CustomEvent in the new path — Navigator just calls methods on the wrapper.

Eleven components migrated. Two did not.

## The two stacks

### Old stack — `use:navigator` action + `ListController`

| File | Lines | Role |
|---|---:|---|
| `packages/actions/src/navigator.svelte.js` | 235 | Svelte action; dispatches `CustomEvent('action', ...)`; handles keydown/click/typeahead/scrollIntoView. |
| `packages/states/src/list-controller.svelte.js` | 347 | Class `ListController`; owns `items`, `selectedKeys` (`SvelteSet`), `expandedKeys`, `focusedKey`. Re-derives flat data via `flatVisibleNodes`. Implements `moveFirst/Prev/Next/Last`, `select`, `extendSelection`, `selectRange`, `findByText`, `toggleSelection`. |
| `packages/states/src/table-controller.svelte.js` | 221 | Class `TableController`; composes a `ListController` for rows; owns `columns`, `sortState`, `sortBy`, `clearSort`; delegates navigation/selection. |
| **Subtotal** | **803** | Old stack source. Tests are extra. |

Consumers — exactly two components:

- `packages/ui/src/components/Toolbar.svelte` — `new ListController(...)`, `use:navigator={{ wrapper: controller, orientation }}`, `addEventListener('action', onAction)`, manual `focusByKey`.
- `packages/ui/src/components/Table.svelte` — `new TableController(data, { ... })`, `use:navigator={{ wrapper: controller, orientation: 'vertical' }}`.

### New stack — `Navigator` class + `Wrapper`

| File | Lines | Role |
|---|---:|---|
| `packages/actions/src/navigator.js` | 294 | Class `Navigator`; wires keydown / click / focusin / focusout / wheel to `wrapper[action](path)`; owns typeahead, focus sync, contained `scrollIntoView`. |
| `packages/states/src/wrapper.svelte.js` | 272 | Class `Wrapper`; reads `ProxyTree.flatView`; owns `focusedKey` ($state) + `select/toggle/expand/collapse/moveTo/moveToValue/findByText/cancel/blur`. Computes navigable subset by excluding `separator`, `spacer`, and `disabled` items. |
| `packages/states/src/lazy-wrapper.svelte.js` | 115 | Extends `Wrapper`; overrides `expand/select/toggle` to detect unloaded `LazyProxyItem` sentinels and fire `proxy.fetch()` before delegating. Adds `loadMore()` for root-level pagination. |
| **Subtotal** | **681** | New stack source. |

Consumers — 11 components, all in `packages/ui/src/components/`:

`Tabs`, `LazyTree`, `Toggle`, `Dropdown`, `Swatch`, `Select`, `MultiSelect`, `Menu`, `Tree`, `List`, `Grid`.

The shape in each is identical:

```js
import { Wrapper, ProxyTree } from '@rokkit/states'
import { Navigator } from '@rokkit/actions'

const proxyTree = $derived(new ProxyTree(items, { fields }))
const wrapper   = $derived(new Wrapper(proxyTree, { onselect, collapsible }))

let rootRef = $state(null)
$effect(() => {
  if (!rootRef) return
  const nav = new Navigator(rootRef, wrapper, { collapsible, dir })
  return () => nav.destroy()
})
```

### Files the backlog item asked about but that don't exist

The backlog assumed there were `NestedController` and `TabsController` classes. There aren't. Tree navigation is `Wrapper` + nested `ProxyTree`; tab navigation is `Wrapper` over a flat list with `orientation: 'horizontal'`. Both already collapsed into the same surface — that was part of the ADR-003 unification.

## Pre-ADR-003 leftovers

Code that exists only to support the old stack and that no other consumer needs:

| Item | Where | Notes |
|---|---|---|
| Old `navigator` Svelte action | `actions/src/navigator.svelte.js` (235) + export in `actions/src/index.js` | The `emitAction(node, controller, name, lastOnly)` + `CustomEvent('action', ...)` dispatch path. Untouched by 11 of 13 list-shaped components. |
| `ListController` | `states/src/list-controller.svelte.js` (347) + export in `states/src/index.js` | Re-implements what `Wrapper + ProxyTree` already do. Maintains its own `selectedKeys`/`expandedKeys` SvelteSets, its own `flatVisibleNodes` re-derivation, its own `findByText`. |
| `TableController` | `states/src/table-controller.svelte.js` (221) + export in `states/src/index.js` | Composes `ListController` — falls when the dependency falls. Sort logic (`sortBy`, `clearSort`, `#applySortAndUpdate`) is the only piece worth preserving and belongs on the new `ProxyTable` per the Tree-Table backlog. |
| `Traversal` | `states/src/traversal.svelte.js` (137) | Class. Not exported from `@rokkit/states/index.js`. No `import { Traversal }` anywhere in `packages/` or `apps/` except its own spec. Dead code. |

**Removable lines (source):** 235 + 347 + 221 + 137 = **940**.

Test files (e.g. `states/spec/list-controller.spec.svelte.js`, `traversal.spec.svelte.js`, `actions/spec/navigator.spec.svelte.js`) drop with their targets — adds more.

## Consumer API surface — what the old stack publishes that callers depend on

Toolbar (the simpler of the two stragglers) reads from `ListController`:

- `controller.focusedKey` (read + sync via `focusin` listener)
- `controller.focused` / `controller.selected` (read for display + onselect callbacks)
- `controller.moveTo(path)` / `moveToIndex(i)` / `moveToValue(v)` (write — sync on prop change)
- `controller.select(key)` (write — from `action` event handler)
- `controller.update(items)` (write — when `value`/`items` prop changes)

All of these have equivalents on `Wrapper`:

| `ListController` | `Wrapper` |
|---|---|
| `focusedKey` | `focusedKey` |
| `focused` | (read via `wrapper.lookup.get(focusedKey).value`) |
| `selected` (array) | (TODO: multi-select on `Wrapper` is stubbed — `extend`/`range` are no-ops) |
| `moveTo(path)` | `moveTo(path)` |
| `moveToValue(v)` | `moveToValue(v)` |
| `select(key)` | `select(path)` |
| `update(items)` | (drive via reactive `$derived(new ProxyTree(items, ...))`) |
| `findByText(q, after)` | `findByText(q, after)` |

Table additionally needs the sort surface (`sortBy`, `clearSort`, `sortState`, `columns`) — that part has no `Wrapper` equivalent yet and is the substantive new work in Tree-Table Part A.

### Multi-select gap

`Wrapper.extend(_path)` and `Wrapper.range(_path)` are currently empty methods with `// not yet implemented` comments. The 11 migrated components don't use multi-select via `Wrapper` (MultiSelect manages its own selected-values array externally). `ListController` *does* implement `extendSelection` + `selectRange` + `selectedKeys` properly. Before retiring `ListController`, either:

- Port the multi-select logic onto `Wrapper`, **or**
- Confirm that Toolbar (only old-stack consumer besides Table) doesn't need range selection. (Looking at Toolbar's onselect: it's single-select today.)

A spot-check on Toolbar suggests single-select only. Table uses `multiselect: true` for row selection — Table's migration **does** need multi-select on `Wrapper`.

This is the only real blocker on the migration. Estimated cost: porting `toggleSelection`, `extendSelection`, `selectRange`, and `selectedKeys` from `ListController` (~60 lines, mostly direct copy with `proxyTree.lookup` swapped for `lookup`) onto `Wrapper`.

## Risk assessment per candidate removal

| Candidate | Risk | Mitigation |
|---|---|---|
| Delete `navigator.svelte.js` (action) | Low. Used only by Toolbar + Table. Tests for it can drop with it. | After Toolbar + Table migrate, grep for `use:navigator=` and `from '@rokkit/actions'.*navigator(?!\\.)` to confirm zero consumers. |
| Delete `ListController` | Low. Used only by Toolbar + Table-via-composition. Public-API: the class is exported from `@rokkit/states` and listed in the `app/learn` LLM docs — those need updating. | Update exports in `states/src/index.js`. Update `apps/learn/static/llms/packages/states.txt`, `apps/learn/src/lib/guides/{toolkit,utilities,accessibility}/content.md`. |
| Delete `TableController` | Low. Used only by `Table.svelte`. Sort logic must port to `ProxyTable` (Tree-Table Part A explicitly calls this out). | Tree-Table Part A is a hard prereq. |
| Delete `Traversal` | None — zero consumers, not exported. Spec file drops with it. | None. |
| Port multi-select to `Wrapper` | Low–medium. New code, but logic is straightforward and `ListController` is a faithful reference. | Cover with a unit spec mirroring `list-controller.spec` for multi-select. |

No risk to the 11 already-migrated components — none import from the soon-to-be-deleted files.

## Native-vs-stack value re-confirmation (from the backlog)

The backlog asked whether the action/controller stack is doing more than the browser already does with `<button>` items. The original table in the backlog is correct: **roving tabindex, arrow navigation, Home/End/PageUp/PageDown, typeahead, expand/collapse, orientation-aware arrows** — none of these come from the browser. The stack stays. The audit's verdict is about which **code in** the stack should stay, not whether to strip the stack.

## Recommendation

**Refactor in place** (in this order, each one its own commit):

1. **Port multi-select to `Wrapper`** — `extend`, `range`, expose `selectedKeys` / `selected`. Add a unit spec.
2. **Migrate `Toolbar.svelte`** to `Wrapper + Navigator` class. Delete its `use:navigator` action call and `addEventListener('action', ...)` plumbing.
3. **Tree-Table Part A** (already scoped) — migrates `Table.svelte` to `TableWrapper + Navigator` class and introduces `ProxyTable` for sort + columns.
4. **Delete** `navigator.svelte.js`, `list-controller.svelte.js`, `table-controller.svelte.js`, `traversal.svelte.js`. Remove their exports. Update LLM docs + guide markdown that mentions the old class names.

Estimated source reduction once all steps land: **~940 lines deleted** (plus their specs), against **~60 lines added** for multi-select on `Wrapper`.

No replacement framework is needed. The new stack is already the simpler shape.

## Out of scope (deliberately)

- The `useListNavigation(items)` hook spike from the backlog. The class-based `Navigator + Wrapper` split is fine — the duplication that motivated the question was the old/new fork, not the class hierarchy.
- `navigable.svelte.js`, `delegateKeyboardEvents`, `keyboard.svelte.js` — independent actions used by unrelated consumers (`TableOfContents`, etc.). They were never part of the list-navigation stack and don't need touching.
- Touching any of the 11 already-migrated components' public APIs.
