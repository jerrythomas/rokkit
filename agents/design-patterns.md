# Design Patterns

Established patterns cookbook. Add patterns here once they are proven (used in 2+ places).
Reference this file before implementing new features to ensure consistency.

---

## How to Use This File

1. **Before implementing**: Check if an existing pattern applies
2. **After implementing**: If you created a new reusable pattern, document it here
3. **Format**: Each pattern includes context (when to use), the pattern itself, and an example

---

## Patterns

### State Icons

**Context:** When a component needs icons for UI states (expand/collapse, checked/unchecked, copy actions, etc.).

**Architecture — Two-Layer Customization:**

1. **Global** — Semantic icon names are defined in `packages/core/src/constants.js` as the `defaultIcons` array (e.g., `node-opened`, `selector-closed`, `action-copy`). The `iconShortcuts(defaultIcons, 'i-rokkit')` function in `uno.config.js` creates UnoCSS shortcuts that map these semantic names to actual icon classes (e.g., `node-opened` → `i-rokkit:node-opened`). Swapping the icon collection globally changes all icons.

2. **Per-instance** — Each component accepts an `icons` prop that merges with defaults, allowing overrides for a specific usage.

**Key Files:**

| File | Purpose |
|------|---------|
| `packages/core/src/constants.js` | `defaultIcons` array + `stateIconsFromNames()` → `defaultStateIcons` |
| `packages/icons/src/base/` | SVGs matching the naming convention (`node-opened.svg`, etc.) |
| `sites/learn/uno.config.js` | `iconShortcuts(defaultIcons, 'i-rokkit')` global mapping |
| `packages/core/src/utils.js` | `iconShortcuts()` function |

**Naming Convention:**

Flat icon names follow `{group}-{state}` pattern:
- `node-opened`, `node-closed` — Tree expand/collapse
- `selector-opened`, `selector-closed` — Select/Menu dropdown arrow
- `accordion-opened`, `accordion-closed` — List collapsible groups
- `action-copy`, `action-copysuccess` — Code copy button
- `action-remove` — MultiSelect tag remove
- `checkbox-checked`, `checkbox-unchecked` — Selection indicator
- `rating-filled`, `rating-empty`, `rating-half` — Rating stars

`stateIconsFromNames()` converts these to nested objects: `defaultStateIcons.node.opened` → `'node-opened'`

**Pattern — Adding State Icons to a Component:**

1. **Define types** in `packages/ui/src/types/{component}.ts`:

```typescript
import { defaultStateIcons } from '@rokkit/core'

export interface {Component}StateIcons {
  opened?: string
  closed?: string
}

export const default{Component}StateIcons: {Component}StateIcons = {
  opened: defaultStateIcons.{group}.opened,
  closed: defaultStateIcons.{group}.closed,
}
```

2. **Add to props interface**:

```typescript
export interface {Component}Props {
  icons?: {Component}StateIcons
  // ...other props
}
```

3. **Use in component** with merge-with-defaults pattern:

```svelte
<script lang="ts">
  import { default{Component}StateIcons } from '../types/{component}.js'

  let { icons: userIcons, ...rest } = $props()
  const icons = $derived({ ...default{Component}StateIcons, ...userIcons })
</script>

<span class={icons.opened} aria-hidden="true"></span>
```

4. **Add new icon names** — If a new state is needed:
   - Add flat name to `defaultIcons` array in `packages/core/src/constants.js`
   - Add SVG to `packages/icons/src/base/{group}-{state}.svg`
   - The UnoCSS shortcut is auto-generated via `iconShortcuts()`

**Used in:** Tree, Select, MultiSelect, Menu, List, Code

---

### Value Binding Contract

**Context:** Any data-driven selection component (Toggle, Select, MultiSelect, List, Tree, Menu).

**Contract:**

| Prop | Type | Description |
|------|------|-------------|
| `value` (bindable) | `unknown` (single) or `unknown[]` (multi) | The **extracted value-field primitive** — what `item[fields.value]` resolves to. For string arrays, the item itself. |
| `onchange` / `onselect` | `(value, item) => void` | First arg: extracted primitive. Second arg: the full item object from the options array. |

**Rationale:** Consumers typically bind to an id or key (`bind:value={selectedId}`), not a full object. When the full object is needed, it's available via the callback's second argument. This matches native `<select>` semantics where `value` is the option's value attribute.

**How it works with field mapping:**

```svelte
<!-- fields.value defaults to 'value', so value binds to item.value -->
<Select options={users} fields={{ text: 'name', value: 'id' }} bind:value={selectedUserId} />

<!-- For string arrays, the item IS the value -->
<Toggle options={['day', 'week', 'month']} bind:value={period} />
```

**ItemProxy resolution order** for extracting value (`itemValue` getter):
1. Mapped value field: `item[fields.value]`
2. Fallback fields: `id`, `key`, `value`
3. Last resort: the original item itself (covers string/number arrays)

**ListController integration:**
`ListController.findByValue()` accepts both full item objects (deep equality) and extracted value-field primitives (fallback match via `item[fields.value]`). Components pass the extracted value directly:

```svelte
let controller = new ListController(options, value, userFields)
// value can be 'a' and controller finds { text: 'A', value: 'a' }
```

**Guard pattern for value sync:**
When using `ListController` + `navigator`, arrow keys move focus without changing selection. Use `lastSyncedValue` to prevent the value-sync `$effect` from fighting navigator focus moves:

```svelte
let lastSyncedValue = value

$effect(() => {
  if (value !== lastSyncedValue) {
    lastSyncedValue = value
    controller.moveToValue(value)
  }
})
```

**Current compliance:**

| Component | `value` type | `onchange`/`onselect` sig | Status |
|-----------|-------------|---------------------------|--------|
| Toggle | extracted primitive | `(value, item)` | Compliant |
| Select | extracted primitive | `(value, item)` + `selected` bindable for full item | Compliant |
| List | extracted primitive | `(value, item)` | Compliant |
| Tree | extracted primitive | `(value, item)` | Compliant |
| MultiSelect | extracted primitive array | `(values, items)` + `selected` bindable for full items | Compliant |

**Used in:** Toggle, Select, MultiSelect, List, Tree.
