# ProxyItem Unification — Design Document

**Backlog:** #3 — ItemProxy + Proxy → Deprecate in favour of ProxyItem
**Date:** 2026-03-01

## Goal

Eliminate the legacy `ItemProxy` (ui) and `Proxy` (states) classes, making `ProxyItem` the single proxy abstraction across the entire library.

## Decisions

1. **Replace ItemProxy with ProxyItem directly** — all 8 components import ProxyItem from @rokkit/states
2. **ProxyItem constructor already has optional key/level** — `constructor(raw, fields = {}, key = '', level = 0)`, no change needed
3. **Delete legacy Proxy class** — only used in testbed, has Ramda dependency
4. **Use BASE_FIELDS as-is** — no fallback chains from ItemProxy; explicit field mapping is cleaner

## API Mapping

| ItemProxy getter | ProxyItem equivalent | Notes |
|---|---|---|
| `.text` | `.label` | BASE_FIELDS.label → 'text' |
| `.itemValue` | `.value` | BASE_FIELDS.value → 'value' |
| `.icon` | `.get('icon')` | |
| `.description` | `.get('subtext')` | BASE_FIELDS.subtext → 'description' |
| `.shortcut` | `.get('shortcut')` | |
| `.label` (ARIA) | `.label` | Same |
| `.disabled` | `.disabled` | ProxyItem has this getter |
| `.active` | N/A | Components use external `value` comparison |
| `.itemType` | `.get('type')` | |
| `.has(field)` | `.get(field) != null` | |
| `.get(field)` | `.get(field)` | Same API |
| `.snippetName` | `.get('snippet')` | |
| `.hasChildren` | `.hasChildren` | Same |

Key renames: `.text` → `.label`, `.itemValue` → `.value`.

## Affected Components

### Items-array components (iterate items, create ProxyItem per item)
- **Toolbar** — `createProxy` helper
- **BreadCrumbs** — `createProxy` helper
- **Timeline** — inline in each loop
- **FloatingAction** — `createProxy` helper + flatItems mapping
- **FloatingNavigation** — mapped array with proxy + original

### Prop-synthesis components (create ProxyItem from component props)
- **Button** — synthesizes from `label`, `icon`, `iconRight` props
- **Pill** — string/object toggle
- **Switch** — two fixed proxies for off/on states

## Migration Patterns

**Button** (prop-synthesis):
```js
// Before: new ItemProxy({ text: label, icon, iconRight }, { text: 'text', icon: 'icon' })
// After:  new ProxyItem({ text: label, icon, iconRight }, { label: 'text', icon: 'icon' })
```

**Items-array** (Toolbar, BreadCrumbs, etc.):
```js
// Before: new ItemProxy(item, userFields)
// After:  new ProxyItem(item, userFields)
```

**Pill** (string primitives):
```js
// Before: new ItemProxy(typeof value === 'string' ? { text: value, value } : value, fields)
// After:  new ProxyItem(value, fields)  // ProxyItem handles primitives natively
```

## Dead Code Removal

1. Delete `packages/ui/src/types/item-proxy.ts`
2. Delete `packages/states/src/proxy.js`
3. Remove Proxy export from `packages/states/src/index.js`
4. Remove ItemProxy re-export from `packages/ui/src/types/index.ts`
5. Migrate testbed tests from Proxy to ProxyItem

## Approach

Incremental migration (Approach A):
1. Migrate items-array components first (5 components)
2. Migrate prop-synthesis components (3 components)
3. Delete ItemProxy
4. Delete Proxy + migrate testbed tests
5. Clean up exports
