# Component Gaps & Migration Issues

> Tracking components with known issues after Svelte 5 migration

## Critical Issues

### TreeTable.svelte

**Status**: ❌ Broken - Multiple critical issues

**Location**: `/packages/ui/src/TreeTable.svelte`

| Issue | Line | Description |
|-------|------|-------------|
| Missing `dispatch` | 8, 42, 77 | `dispatch()` called but never defined (commented out) |
| Undefined `stopPropagation` | 133 | Helper function used but never imported/defined |
| Undeclared `mapping` | 137, 162 | Variable used but not in props or imports |
| Legacy pattern | - | Uses `mapping` instead of `fields` prop |

**Root Cause**: Incomplete Svelte 5 migration - still has Svelte 4 patterns mixed with partial runes.

**Fix Required**:
```svelte
// Replace dispatch with createEmitter or callback props
// Replace mapping with fields + Proxy pattern
// Inline stopPropagation or import helper
```

---

### Select.svelte

**Status**: 🟡 Partially broken - Event handling issues

**Location**: `/packages/ui/src/Select.svelte`

| Issue | Line | Description |
|-------|------|-------------|
| Missing `dispatch` | 30-31 | `dispatch('select')` and `dispatch('change')` called without definition |
| `activeIndex` not tracked | 16, 35-49 | Index doesn't update when value changes externally |
| `activeItem` reactivity | 47, 87 | `offsetTop` derived but not properly reactive to element changes |

**Root Cause**: Event dispatch not wired up after runes migration.

**Fix Required**:
```svelte
// Option 1: Use createEmitter pattern (like List)
const emitter = createEmitter({ onselect, onchange }, ['select', 'change'])

// Option 2: Use callback props directly
onselect?.(value)
onchange?.(value)
```

---

### MultiSelect.svelte

**Status**: ❌ Not migrated - Still Svelte 4 syntax

**Location**: `/packages/ui/src/MultiSelect.svelte`

| Issue | Line | Description |
|-------|------|-------------|
| `export let` pattern | 8-14 | Uses Svelte 4 `export let` instead of `$props()` |
| `$:` reactive statements | 23-26 | Uses `$:` instead of `$derived` |
| Missing `$bindable()` | 9, 10 | `value` and `options` should be bindable |
| Class prop pattern | 7 | Uses old `export { className as class }` pattern |

**Root Cause**: Component was never migrated to Svelte 5 runes.

**Fix Required**:
```svelte
// Before (Svelte 4)
export let value = []
export let options = []
$: available = options.filter(...)

// After (Svelte 5)
let {
  value = $bindable([]),
  options = $bindable([]),
  class: className = ''
} = $props()

let available = $derived(options.filter(...))
```

---

## Components Working Well (Reference Patterns)

### Tree Components ✅

**Location**: `/packages/ui/src/tree/`

The Tree components (Root.svelte, List.svelte, Node.svelte) are properly migrated and serve as reference implementations:

```svelte
// Root.svelte - Correct pattern
let {
  items = $bindable([]),
  value = $bindable(null),
  fields = {},
  class: className = '',
  onselect,
  ontoggle
} = $props()

let wrapper = $derived(new NestedController(items, fields))
```

### List.svelte ✅

Uses proper runes, Proxy system, and createEmitter for events.

### Tabs.svelte ✅

Properly migrated with `$props()`, `$derived`, and event handling.

---

## Migration Checklist

When fixing components, ensure:

- [ ] Convert `export let` → `$props()` with destructuring
- [ ] Add `$bindable()` for two-way bound props (value, items/options)
- [ ] Convert `$:` → `$derived()` for computed values
- [ ] Convert `$:` statements with side effects → `$effect()`
- [ ] Replace `createEventDispatcher` → `createEmitter` or callback props
- [ ] Use `fields` prop with Proxy system (not `mapping`)
- [ ] Replace `using` prop with snippet-based customization
- [ ] Update class prop: `class: className = ''` in $props()
- [ ] Add proper TypeScript types if applicable

---

## Priority Order

| Priority | Component | Effort | Impact |
|----------|-----------|--------|--------|
| 1 | MultiSelect | Medium | High - commonly used |
| 2 | Select | Low | High - commonly used |
| 3 | TreeTable | High | Medium - complex component |

---

## Testing Gaps

| Component | Has Tests | Test Coverage |
|-----------|-----------|---------------|
| TreeTable | ❌ No | 0% - needs test file |
| Select | 🟡 Partial | Basic render only, events not tested |
| MultiSelect | 🟡 Partial | Basic render only |
| Tree | ✅ Yes | Good coverage with snapshots |
| List | ✅ Yes | Good coverage |

---

## Related

- [ADR-001: Component Architecture](../decisions/001-component-architecture.md) - Standardization decisions
- [Component Status Matrix](./component-status.md) - Full status tracking
- `.rules/project/progress.md` - Development progress
