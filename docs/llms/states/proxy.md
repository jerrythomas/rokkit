# Proxy

> Wraps a data item with Svelte 5 reactivity and field mapping. Recursively wraps children. Used internally by controllers.

**Package**: `@rokkit/states`
**File**: `proxy.svelte.js`

## Constructor

```javascript
const proxy = new Proxy(item, fields)
```

## Properties

```javascript
proxy.id                    // Auto-generated UUID or item[fields.id]
proxy.value                 // Original unwrapped item object
proxy.children              // Proxy-wrapped children array ($derived)
proxy.hasChildren           // Boolean: has non-empty children array
proxy.expanded              // Expansion state ($state, get/set)
proxy.fields                // Field mapping (get/set)
```

## Methods

```javascript
proxy.get(fieldName, defaultValue)            // Gets item[fields[fieldName]], with default
proxy.has(fieldName)                          // Checks if mapped field exists on item
proxy.getSnippet(snippets, defaultSnippet)    // Gets snippet function by item.snippet key
```

## When to Use

`Proxy` is for **state** — it's a reactive wrapper used inside controllers. It differs from `ItemProxy` (in `@rokkit/ui`) which is a **read-only view mapper** used in component templates.

| Class | Package | Purpose |
|-------|---------|---------|
| `Proxy` | `@rokkit/states` | Reactive field-mapped wrapper with expansion state |
| `ItemProxy` | `@rokkit/ui` | Read-only field accessor for template rendering |

## Example

```javascript
import { Proxy } from '@rokkit/states'

const proxy = new Proxy(
  { label: 'Fruits', items: [{ label: 'Apple' }] },
  { text: 'label', children: 'items' }
)

proxy.get('text')       // 'Fruits'
proxy.hasChildren       // true
proxy.children          // [Proxy { value: { label: 'Apple' }, ... }]
proxy.expanded = true   // reactive
```

## Notes

- Created by `deriveLookupWithProxy()` inside controllers — you generally don't create `Proxy` instances directly.
- `proxy.children` is `$derived` — automatically wraps new children when `item[fields.children]` changes.
- The `expanded` state on `Proxy` is a historical pattern; current architecture uses `controller.expandedKeys` (SvelteSet) instead. Do not read `proxy.expanded` for expansion state — use `controller.expandedKeys.has(key)`.
