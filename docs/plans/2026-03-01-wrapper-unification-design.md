# ProxyTree + Wrapper Unification — Design

**Backlog:** #75
**Date:** 2026-03-01

## Problem

Wrapper and LazyWrapper are parallel implementations that duplicate all navigation logic (next, prev, first, last, moveTo, findByText, expand, collapse). Wrapper uses the old `buildProxyList`/`buildFlatView` pipeline while LazyWrapper creates its own ProxyTree internally. This duplication makes changes error-prone and inflates the codebase.

## Design

### ProxyTree — unchanged

ProxyTree already provides: `flatView` ($derived), `lookup` ($derived), `roots`, `append()`, `addChildren()`. No changes needed.

### Wrapper — accepts ProxyTree

Constructor changes from `(items, fields, options)` to `(proxyTree, options)`.

Wrapper reads `proxyTree.flatView` and `proxyTree.lookup` instead of building its own static data pipeline. `#navigable` remains a `$derived` filter over `proxyTree.flatView`. All navigation methods stay on Wrapper unchanged.

### LazyWrapper — extends Wrapper

```
class LazyWrapper extends Wrapper
```

Inherits all navigation. Only overrides:
- `expand(path)` — detects unloaded sentinel nodes, triggers `proxy.fetch()`
- `select(path)` — same sentinel detection
- `loadMore()` — calls `onlazyload()`, appends results via `proxyTree.append()`

All duplicated navigation code is deleted.

### Components — create ProxyTree externally

Every component shifts from:
```js
const wrapper = $derived(new Wrapper(items, fields, { onselect }))
```
to:
```js
const proxyTree = $derived(new ProxyTree(items, fields))
const wrapper = $derived(new Wrapper(proxyTree, { onselect }))
```

LazyTree passes a `createProxy` factory to ProxyTree (already supported).

### lineStyle prop (Tree/LazyTree)

Replace `showLines: boolean` with `lineStyle: 'none'|'solid'|'dashed'|'dotted'` (default `'solid'`).

- Container gets `data-line-style={lineStyle}` attribute
- Base tree.css targets `[data-line-style='solid']`, `[data-line-style='dashed']`, etc.
- `lineTypes` from ProxyTree's `buildReactiveFlatView` drives line segments

### Dead code removal

- `buildProxyList()` — replaced by ProxyTree
- `buildFlatView()` — replaced by ProxyTree.flatView
- `AbstractWrapper` — Wrapper is now the base class
- `PROXY_ITEM_FIELDS` — deprecated alias

## Affected files

**Core:**
- `packages/states/src/wrapper.svelte.js` — refactor constructor
- `packages/states/src/lazy-wrapper.svelte.js` — extend Wrapper
- `packages/states/src/index.js` — remove dead exports

**Components (create ProxyTree externally):**
- List, Menu, Select, MultiSelect, Toggle, Tabs — Wrapper consumers
- Tree, LazyTree — LazyWrapper consumers

**Tree lineStyle:**
- `packages/ui/src/components/Tree.svelte` — showLines → lineStyle prop
- `packages/ui/src/components/LazyTree.svelte` — same
- `packages/themes/src/base/tree.css` — data-line-style selectors

**Dead code removal:**
- `packages/states/src/proxy-item.svelte.js` — remove buildProxyList, buildFlatView exports
- `packages/states/src/abstract-wrapper.js` — delete file
