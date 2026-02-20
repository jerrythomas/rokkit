# @rokkit/states

> Svelte 5 state management — Proxy field mapping, list/tree controllers, theme (Vibe), and localization (Messages).

## Position in Dependency Hierarchy
**Depends on**: @rokkit/core, d3-array, d3-collection, @lukeed/uuid, ramda, svelte
**Depended on by**: @rokkit/actions (dev), @rokkit/composables, @rokkit/forms, @rokkit/chart

## Exports

### Proxy

Wraps a data item with Svelte reactivity and field mapping. Recursively wraps children.

```javascript
const proxy = new Proxy(item, fields)

proxy.id                    // Auto-generated or from item
proxy.value                 // Original unwrapped object
proxy.children              // Proxy-wrapped children array (derived)
proxy.hasChildren           // Boolean: has children array
proxy.expanded              // Expansion state (get/set)
proxy.fields                // Field mapping (get/set)
proxy.get(fieldName, defaultValue)      // Gets mapped field value
proxy.has(fieldName)                    // Checks if mapped field exists
proxy.getSnippet(snippets, defaultSnippet)  // Gets snippet by key
```

### ListController

Manages state for flat/list data: navigation, selection, focus, field mapping.

```javascript
const controller = new ListController(items, value, fields, { multiselect: false })

// Navigation
controller.moveFirst() / controller.moveLast()
controller.moveNext() / controller.movePrev()
controller.moveToIndex(index)
controller.moveToValue(value)
controller.moveTo(path)

// Selection
controller.select(key)                  // Single select + move focus
controller.extendSelection(key)         // Toggle if multiselect, else select
controller.toggleSelection(key)         // Toggle key in selection set

// Reactive state
controller.data                         // Flat visible nodes (derived)
controller.lookup                       // Map<key, Proxy> (derived)
controller.focusedKey                   // Currently focused key
controller.selectedKeys                 // SvelteSet of selected keys
controller.focused                      // Value at focusedKey (derived)
controller.selected                     // Array of selected values (derived)
controller.currentIndex                 // Numeric index of focused item
controller.items                        // Item array (get/set)
controller.fields                       // Field mapping (get/set)
```

### NestedController

Extends ListController for hierarchical data with expansion/collapse.

```javascript
const controller = new NestedController(items, value, fields, options)

// All ListController methods plus:
controller.expand(key)
controller.collapse(key)
controller.toggleExpansion(key)
controller.ensureVisible(value)         // Expand all parents to show item
```

### Vibe (Singleton)

Global theme/appearance state manager.

```javascript
import { vibe } from '@rokkit/states'

// Properties (reactive get/set)
vibe.mode               // 'light' | 'dark'
vibe.style              // Theme style name (e.g., 'rokkit')
vibe.density            // 'cozy' | 'compact' | 'comfortable'
vibe.direction          // 'ltr' | 'rtl' (auto-detected)
vibe.colors             // Color palette object
vibe.colorMap           // Variant → color key mapping
vibe.palette            // Computed CSS variable rules (derived)
vibe.allowedStyles      // Array of allowed style names
vibe.isRTL              // Boolean

// Methods
vibe.load(key)          // Load theme from localStorage
vibe.save(key)          // Save to localStorage
vibe.update(partial)    // Update multiple properties
vibe.detectDirection()  // Re-detect from document
```

### MessagesStore (Singleton)

Global localization store.

```javascript
import { messages } from '@rokkit/states'

messages.current        // Current messages object
messages.set(custom)    // Set custom messages (merges with defaults)
messages.reset()        // Reset to defaults
// Defaults: { emptyList, emptyTree, loading, noResults, select, search }
```

### TableWrapper

Basic wrapper for tabular data.

```javascript
const table = new TableWrapper(items)
table.data              // Item array
table.headers           // Headers array (state)
```

## Key Patterns

### Controller-Based Navigation

```javascript
let controller = new ListController(items, null, defaultFields)
controller.moveFirst()
controller.select()  // Selects first item
// controller.selected → [Item 1 object] (reactive)
```

### Proxy Wrapping

```javascript
const proxy = new Proxy(rawItem, { text: 'label', children: 'items' })
proxy.get('text')           // Safe field access
proxy.children              // Auto-wrapped child proxies
```

## Internal (not exported but notable)

| Module | What | Notes |
|--------|------|-------|
| `derive.svelte.js` | `deriveLookupWithProxy()`, `flatVisibleNodes()` | Controller derivation helpers |
| `constants` | `VALID_MODES`, `VALID_DENSITIES`, `DEFAULT_STYLES` | Vibe validation constants |
