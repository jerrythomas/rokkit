# States Package Requirements

> Requirements for the reactive data management layer in `@rokkit/states`: ProxyItem, ProxyTree, Wrapper, LazyWrapper.

## 1. Overview

The `@rokkit/states` package provides the reactive data layer for all interactive components. It owns:

- **ProxyItem** — per-item reactive model with field mapping, hierarchy, and control state
- **ProxyTree** — reactive collection manager: owns proxy instances, supports append and addChildren
- **Wrapper** — navigation/selection logic for persistent components (List, Tree, Sidebar)
- **LazyWrapper** — extends Wrapper with lazy loading: on-demand children fetch and root pagination

## 2. ProxyItem

### 2.1 Purpose

Wraps a raw data item (object or primitive) and provides:
- Uniform field access via configurable field mapping
- Reactive control state (`expanded`, `selected`) as `$state`
- Auto-wrapped children via `$derived` with stable references
- Path-based key (`'0'`, `'0-1'`, `'0-1-2'`) and nesting level

### 2.2 Field Mapping

Default semantic fields map to raw item keys:

| Semantic | Default Key | Purpose |
|----------|-------------|---------|
| `text` | `'text'` | Display text |
| `value` | `'value'` | Selection/matching value |
| `icon` | `'icon'` | Icon class |
| `href` | `'href'` | Navigation URL |
| `content` | `'content'` | Rich content |
| `description` | `'description'` | Secondary text |
| `title` | `'title'` | Title text |
| `children` | `'children'` | Nested items array |
| `type` | `'type'` | Item type (`separator`, `spacer`) |
| `disabled` | `'disabled'` | Disabled state |
| `expanded` | `'expanded'` | Expansion state |
| `selected` | `'selected'` | Selection state |
| `snippet` | `'snippet'` | Named snippet key |

### 2.3 Control State Modes

- **External**: Item has the field → proxy reads/writes through to raw item
- **Internal**: Item lacks the field → proxy owns it as `$state`
- Primitives always use internal mode

### 2.4 Children

- Auto-wrapped as ProxyItem instances via `$derived`
- Keys propagated: parent `'0'` → children `'0-0'`, `'0-1'`, etc.
- Levels propagated: parent level + 1
- `_createChild()` factory method — overridable in subclasses
- Version counter (`#version`) triggers children recomputation after `set()`

### 2.5 API Surface

```
ProxyItem(raw, fields?, key?, level?)

// Field access
get(fieldName) → value
set(fieldName, value)  — writes through field mapping, bumps version
mutate(field, value)   — writes to original raw data, bumps version (advanced)

// Direct getters (limited set)
label, value, id       — primary access (all others via get())
original               — original raw input
hasChildren, children, type, key, level

// Control state
expanded  (get/set)
selected  (get/set)
```

### 2.6 LazyProxyItem Extension

Adds lazy loading support:

- `#lazyLoad` — async callback `(value, raw) => children[]`
- `#loaded` — false only for lazy marker nodes (`children: true`)
- `#loading` — true during async fetch
- `fetch()` — calls lazyLoad, writes children via `set()`, triggers recomputation
- `_createChild()` override propagates lazyLoad to all descendants

### 2.7 Deprecation: ItemProxy and Proxy

**ItemProxy** (`@rokkit/ui/types/item-proxy.ts`) and **Proxy** (`@rokkit/states/proxy.svelte.js`) are legacy classes that ProxyItem supersedes.

**ItemProxy** — pure TypeScript, read-only, no reactivity. Notable features to preserve in ProxyItem:
- Fallback text resolution chain: `label → name → title → text → stringify`
- Fallback value resolution chain: `value → id → key → original`
- Shortcut field fallback: `shortcut → kbd → hotkey → accelerator → keyBinding`
- Description fallback: `description → hint → subtitle → summary`
- `canLoadChildren` — detect lazy marker (`children: true`)
- Typed `get<V>(fieldName, defaultValue)` with generics
- `snippetName` getter and `getSnippet(snippets, default)` convenience method

**Proxy** — Svelte 5 reactive, uses Ramda (`isNil`, `has`). Superseded by ProxyItem which:
- Has no Ramda dependency
- Has writable `set()` with version tracking
- Manages `expanded`/`selected` as `$state` (vs Proxy's read-only expanded)
- Uses path-based keys (vs Proxy's UUID-based `#id`)
- Has proper primitive normalisation

**Migration plan**: Components currently using ItemProxy (16 files in `@rokkit/ui`) will migrate to ProxyItem. Components using Proxy (legacy) are already migrated. Both classes remain available until all consumers are updated, then removed.

**Features to port to ProxyItem before deprecation**:
- Fallback resolution chains (text, value, shortcut, description)
- `getSnippet(snippets, defaultSnippet)` method (currently on Proxy, needed by Toolbar)
- Typed `get<V>()` when ProxyItem gets TypeScript types

## 3. ProxyTree

### 3.1 Purpose

Reactive collection manager that owns proxy instances and provides methods to modify the collection (append, addChildren) with batched version management. Replaces the ad-hoc proxy creation currently scattered across Wrapper and LazyWrapper constructors.

### 3.2 Requirements

1. **Create root proxies** from an items array with field mapping
2. **Append root items** — add items to the end, keys start at current length, single version bump
3. **Add children** to a proxy node — create child proxies, attach to parent, single version bump
4. **Reactive flatView** — `$derived` flat array that rebuilds when version changes (expansion or structural changes)
5. **Reactive lookup** — `$derived` Map<key, ProxyItem> covering all proxies
6. **Stable proxy references** — proxies created once, never recreated
7. **Custom proxy factory** — support `createProxy` option for LazyProxyItem

### 3.3 API Surface

```
ProxyTree(items, fields?, { createProxy? })

// Mutation (each bumps version exactly once)
append(items)                    — add root-level items
addChildren(proxy, items)        — add children to a specific node

// Reactive reads
get roots()                      — root proxy array
get flatView()                   — $derived flat array with tree line types
get lookup()                     — $derived Map<key, ProxyItem>
```

### 3.4 Version Management

- Single `$state` version counter
- `append(20 items)` → creates 20 proxies, bumps version once
- `addChildren(proxy, items)` → creates child proxies, bumps version once
- `flatView` and `lookup` depend on version via `$derived`

### 3.5 Key Generation

- Path-based: `'0'`, `'1'`, `'2'` for root items
- Children: `'0-0'`, `'0-1'` for children of root `'0'`
- `append()` starts keys at current root count: if 10 roots exist, new items get `'10'`, `'11'`, etc.

## 4. Wrapper

### 4.1 Purpose

Navigation and selection logic for persistent components (List, Tree, Sidebar). Consumes ProxyTree (or buildProxyList) for data, owns focus tracking, keyboard navigation, and selection callbacks.

### 4.2 Interface (IWrapper)

All methods follow the uniform `(path: string | null)` signature for Navigator compatibility:

| Method | Purpose |
|--------|---------|
| `next(path)` | Focus next navigable item |
| `prev(path)` | Focus previous navigable item |
| `first(path)` | Focus first navigable item |
| `last(path)` | Focus last navigable item |
| `expand(path)` | Expand group / enter if open |
| `collapse(path)` | Collapse group / move to parent |
| `select(path)` | Select item (groups toggle) |
| `toggle(path)` | Toggle group expansion |
| `extend(path)` | Toggle individual multi-selection |
| `range(path)` | Select contiguous range |
| `moveTo(path)` | Sync focus to path |
| `cancel(path)` | Escape — close/dismiss |
| `blur()` | Focus left component |
| `findByText(q, k)` | Typeahead search |
| `focusedKey` | Currently focused key (getter) |

### 4.3 Requirements

1. Reads flatView from data source (ProxyTree or buildProxyList + buildFlatView)
2. Filters navigable items (excludes separators, spacers, disabled)
3. Tracks focused key as `$state`
4. Fires `onselect` and `onchange` callbacks on selection
5. Supports typeahead with wrap-around search

## 5. LazyWrapper

### 5.1 Purpose

Extends Wrapper semantics with lazy loading support. Uses ProxyTree internally.

### 5.2 Lazy Loading Contract

**`onlazyload` callback** — provided by the component consumer:

| Call | Meaning | Returns |
|------|---------|---------|
| `onlazyload(item)` | Fetch children for this node | `Promise<unknown[]>` — child items |
| `onlazyload()` | Fetch next batch of root items | `Promise<unknown[]>` — root items to append |

### 5.3 Requirements

1. **Expand unloaded node** → call `onlazyload(proxy.raw)` → `proxyTree.addChildren(proxy, result)`
2. **Load more root items** → call `onlazyload()` → `proxyTree.append(result)`
3. **Lazy marker pattern** — `children: true` (boolean instead of array) marks nodes whose children haven't been fetched yet
4. **Loading state** — `proxy.loading` is true during fetch (for spinner UI)
5. **Loaded state** — `proxy.loaded` transitions from false → true after fetch
6. **LazyLoad propagation** — fetched children inherit the lazyLoad callback

## 6. LazyTree Component

### 6.1 Purpose

Tree component with on-demand lazy loading via `onlazyload` callback and root-level pagination via "Load More" button.

### 6.2 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `unknown[]` | `[]` | Initial items array |
| `fields` | `object` | defaults | Field mapping |
| `value` | `unknown` | — | Selected value (bindable) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `lineStyle` | `'none' \| 'dotted' \| 'dashed' \| 'solid'` | `'solid'` | Tree line connector style (via `data-line-style` attribute) |
| `icons` | `object` | defaults | Expand/collapse icons |
| `onlazyload` | `(current?: unknown) => Promise<unknown[]>` | — | Lazy load callback |
| `hasMore` | `boolean` | `false` | Show "Load More" button |
| `onselect` | `(value, proxy) => void` | — | Selection callback |
| `class` | `string` | — | CSS classes |

### 6.3 Load More Button

- Rendered after all tree items when `hasMore === true`
- Clicking calls `onlazyload()` (no arguments) to fetch next batch
- Result appended to root items via `proxyTree.append()`
- Client controls `hasMore` — sets to `false` when no more data

### 6.4 Expand Lazy Node

- Clicking expand on unloaded node (lazy marker `children: true`) calls `onlazyload(item.original)`
- Shows loading spinner while fetching
- Result added as children via `proxyTree.addChildren(proxy, result)`
- Node auto-expands after children load

## 7. Dependencies

| Package | Depends On | Purpose |
|---------|------------|---------|
| `@rokkit/states` | (none) | ProxyItem, ProxyTree, Wrapper, LazyWrapper |
| `@rokkit/actions` | `@rokkit/states` (IWrapper) | Navigator calls wrapper methods |
| `@rokkit/ui` | `@rokkit/states`, `@rokkit/actions` | Components use Wrapper + Navigator |
