# Field Mapping

> How Rokkit components map arbitrary data shapes to display properties, groups, and values.

**Package**: `@rokkit/ui`
**Key type**: `ItemFields` from `@rokkit/ui/types` (`item-proxy.ts`)

---

## The Problem Field Mapping Solves

Components like `List`, `Select`, `Menu`, and `Tree` need to know which property of each data item to use as the display label, the selectable value, the icon, etc. Rather than requiring a fixed schema, every data-driven component accepts a `fields` prop that tells it which property names to read.

```svelte
<!-- Your data has 'fullName', not 'text' — tell the component -->
<Select options={users} fields={{ text: 'fullName', value: 'id' }} />
```

---

## ItemFields Interface

All field-mapping components share the same `ItemFields` type:

```typescript
interface ItemFields {
  text?:        string   // Display label           — default: 'text'
  value?:       string   // Emitted on selection    — default: 'value'
  icon?:        string   // CSS icon class          — default: 'icon'
  description?: string   // Secondary/subtitle text — default: 'description'
  shortcut?:    string   // Keyboard shortcut label — default: 'shortcut'
  label?:       string   // ARIA aria-label override — default: 'label'
  disabled?:    string   // Disabled state (boolean)— default: 'disabled'
  active?:      string   // Active/pressed state    — default: 'active'
  type?:        string   // Item type (see below)   — default: 'type'
  children?:    string   // Nested children array   — default: 'children'
  snippet?:     string   // Custom snippet name     — default: 'snippet'
  href?:        string   // Navigation URL          — default: 'href'
  badge?:       string   // Badge/indicator text    — default: 'badge'
  fields?:      ItemFields // Nested field mapping for children (inherits parent if omitted)
}
```

Only override what's different from the defaults. Unspecified fields keep their defaults.

---

## Default Field Names

```typescript
// These are used when no fields prop is passed
{
  text:        'text',
  value:       'value',
  icon:        'icon',
  description: 'description',
  shortcut:    'shortcut',
  label:       'label',
  disabled:    'disabled',
  active:      'active',
  type:        'type',
  children:    'children',
  snippet:     'snippet',
  href:        'href',
  badge:       'badge'
}
```

---

## Data Structures

### Flat Array (simplest)

```javascript
// Primitive strings/numbers — text and value are both the item itself
const options = ['Admin', 'Editor', 'Viewer']

// Objects with defaults — no fields prop needed
const items = [
  { text: 'Save',  value: 'save',  icon: 'i-save' },
  { text: 'Open',  value: 'open',  icon: 'i-open' },
]

// Objects with custom property names — use fields prop
const users = [
  { fullName: 'Alice', userId: 1, role: 'admin' },
  { fullName: 'Bob',   userId: 2, role: 'editor' },
]
// <Select options={users} fields={{ text: 'fullName', value: 'userId' }} />
```

### Grouped (List, Select, MultiSelect, Menu)

A group item has a `children` array (or whatever field name you map to `children`). The component detects groups by checking `Array.isArray(item.children)`.

```javascript
// Default 'children' field
const grouped = [
  {
    text: 'File',
    children: [
      { text: 'New',  value: 'new',  icon: 'i-new' },
      { text: 'Open', value: 'open', icon: 'i-open' },
    ]
  },
  {
    text: 'Edit',
    children: [
      { text: 'Cut',   value: 'cut' },
      { text: 'Copy',  value: 'copy' },
      { text: 'Paste', value: 'paste' },
    ]
  }
]

// Custom 'children' field name
const menuData = [
  { label: 'Actions', items: [{ name: 'Run', id: 'run' }] }
]
// fields={{ text: 'label', children: 'items', text: 'name', value: 'id' }}
// — but children inherit parent fields by default, so:
// fields={{ text: 'label', children: 'items', fields: { text: 'name', value: 'id' } }}
```

**Which components support groups:**

| Component | Groups | Notes |
|-----------|--------|-------|
| `List` | Yes | Collapsible with `collapsible` prop |
| `Select` | Yes | Group headers, not selectable |
| `MultiSelect` | Yes | Same as Select |
| `Menu` | Yes | Group headers, not selectable |
| `Tree` | Via children | Every non-leaf is a group |
| `Toolbar` | Via `ToolbarGroup` | Different mechanism (not children array) |

### Tree / Hierarchical (Tree)

Tree items use the same `children` convention as groups, but recursively. Items without a `children` field (or with `children: []`) are leaf nodes.

```javascript
const tree = [
  {
    text: 'src',
    children: [
      {
        text: 'components',
        children: [
          { text: 'Button.svelte' },
          { text: 'List.svelte' },
        ]
      },
      { text: 'index.ts' },
    ]
  },
  { text: 'package.json' }
]
```

### Lazy Loading (Tree only)

When children aren't loaded yet, set `children: true` (truthy, non-array). The Tree component detects this with `canLoadChildren` and calls `onloadchildren` when the node is expanded.

```javascript
const lazyTree = [
  { text: 'Documents', children: true },   // has children, not loaded
  { text: 'Pictures',  children: true },
  { text: 'README.md'                  },  // leaf — no children field
]
```

```svelte
<Tree
  items={lazyTree}
  onloadchildren={async (item) => {
    const data = await fetch(`/api/files/${item.id}`).then(r => r.json())
    return data.children   // return array to replace children: true
  }}
/>
```

---

## Fallback Resolution

`ItemProxy` has smart fallbacks for the most commonly misnamed properties. These kick in when no explicit `fields` mapping is found:

| Field | Fallback property names tried in order |
|-------|----------------------------------------|
| `text` | `label`, `name`, `title`, `text` |
| `value` | `id`, `key`, `value` |
| `description` | `hint`, `subtitle`, `summary` |
| `shortcut` | `kbd`, `hotkey`, `accelerator`, `keyBinding` |

This means many APIs work out-of-the-box without a `fields` prop:

```javascript
// Works without fields — fallback finds 'name' for text, 'id' for value
const countries = [
  { id: 'US', name: 'United States' },
  { id: 'CA', name: 'Canada' },
]
// <Select options={countries} /> — no fields needed!
```

---

## Nested Field Mapping (Children with Different Schema)

If children have different property names than parents, use `fields.fields`:

```javascript
const data = [
  {
    category: 'Fruits',       // parent uses 'category' as text
    items: [                  // parent uses 'items' as children
      { name: 'Apple',  sku: 'A1' },  // children use 'name' and 'sku'
      { name: 'Banana', sku: 'B1' },
    ]
  }
]
```

```svelte
<List
  items={data}
  fields={{
    text: 'category',
    children: 'items',
    fields: { text: 'name', value: 'sku' }   // applied to children
  }}
/>
```

If `fields.fields` is omitted, children inherit the parent `fields` mapping.

---

## The `type` Field — Special Item Behaviours

The `type` field (default: `'type'`) controls how Toolbar and Menu render individual items:

| `type` value | Behaviour |
|-------------|-----------|
| `'button'` | Default — clickable action item |
| `'toggle'` | Stateful on/off button |
| `'separator'` | Visual divider line (not focusable) |
| `'spacer'` | Flexible gap (not focusable) |
| `'custom'` | Rendered via named snippet (`snippet` field) |

```javascript
const toolbarItems = [
  { text: 'Bold',   value: 'bold',   icon: 'i-bold',   type: 'toggle' },
  { type: 'separator' },
  { text: 'Align',  value: 'align',  icon: 'i-align' },
  { type: 'spacer' },
  { text: 'Help',   value: 'help',   icon: 'i-help' },
]
```

Note: `separator` and `spacer` items are excluded from keyboard navigation (they have no `data-path` attribute).

---

## The `snippet` Field — Per-Item Custom Rendering

Any item can specify a named snippet to use for custom rendering. Set the item's `snippet` field (default property: `'snippet'`) to the snippet name, then pass that snippet to the component.

```javascript
const items = [
  { text: 'Normal item', value: 'a' },
  { text: 'Special item', value: 'b', snippet: 'fancy' },
]
```

```svelte
<List {items}>
  {#snippet fancy(item, fields, handlers)}
    <div class="fancy-item" onclick={handlers.onclick}>
      ✨ {item.text}
    </div>
  {/snippet}
</List>
```

---

## Value Binding Contract

`bind:value` always receives the **extracted primitive** (`item[fields.value]`), not the full item object:

```svelte
<!-- value receives item.id, not the full item -->
<Select options={users} fields={{ text: 'name', value: 'id' }} bind:value={userId} />

<!-- For primitive arrays, the item IS the value -->
<Toggle options={['day', 'week', 'month']} bind:value={period} />
```

The full item is accessible via `bind:selected` (single) or `bind:selected` (array for MultiSelect/List).

`onchange(value, item)` — first arg is the primitive, second is the full raw item.

---

## Per-Component Field Notes

| Component | `items`/`options` prop | Uses `children` | Uses `type` | Uses `href` | Uses `badge` |
|-----------|------------------------|-----------------|-------------|-------------|--------------|
| `List` | `items` | Yes (groups) | No | No | No |
| `Tree` | `items` | Yes (nodes) | No | No | No |
| `Select` | `options` | Yes (groups) | No | No | No |
| `MultiSelect` | `options` | Yes (groups) | No | No | No |
| `Menu` | `options` | Yes (groups) | Yes | Yes | No |
| `Toggle` | `options` | No | No | No | No |
| `Toolbar` | `items` | No | Yes | Yes | No |
| `FloatingNavigation` | `items` | No | No | Yes | Yes |
| `Tabs` | `items` | No | No | No | No |
| `Switch` | `options` | No | No | No | No |
| `Table` | `rows` | No | No | No | No |
| `Timeline` | `items` | No | No | No | No |
| `Stepper` | `steps` | No | No | No | No |

---

## Quick Reference

```svelte
<!-- Minimal — works with 'name'/'id' fields via fallback -->
<Select options={[{ id: 1, name: 'Alice' }]} bind:value={id} />

<!-- Explicit mapping -->
<Select
  options={users}
  fields={{ text: 'fullName', value: 'userId', description: 'email', icon: 'avatar' }}
  bind:value={selectedUserId}
/>

<!-- Grouped list, collapsible -->
<List
  items={grouped}
  collapsible
  fields={{ text: 'title', children: 'subitems' }}
  bind:value={selected}
/>

<!-- Tree with lazy loading -->
<Tree
  items={lazyTree}
  fields={{ text: 'name', children: 'kids' }}
  onloadchildren={loadKids}
/>

<!-- Different schema for group headers vs leaf items -->
<Menu
  options={menuData}
  fields={{
    text: 'groupName',
    children: 'actions',
    fields: { text: 'label', value: 'actionId', icon: 'iconClass' }
  }}
/>
```
