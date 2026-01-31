# ADR-001: Component Architecture Strategy

**Status**: Accepted  
**Date**: 2026-01-31  
**Decision Makers**: Project maintainers

## Context

Rokkit has two parallel component implementations:
- `@rokkit/ui` - Custom implementations (57 components)
- `@rokkit/bits-ui` - Wrappers around bits-ui (7 components)

This has led to:
- Duplicate functionality (Tabs vs TabGroup, List vs List)
- Testing challenges with bits-ui wrappers
- Inconsistent APIs and naming conventions
- Confusion about which package to use

## Decision

### 1. Focus on Custom Implementations First

Prioritize `@rokkit/ui` custom components. They offer:
- Full control over behavior and testing
- Consistent data-driven patterns
- Better integration with Rokkit's Proxy and Controller systems

### 2. Standardize on `options` for Data Props

All selection/list components will use `options` (not `items`):

```svelte
<!-- Standard pattern -->
<List options={data} bind:value fields={{ text: 'name' }} />
<Select options={data} bind:value />
<Tabs options={data} bind:value />
<Tree options={data} bind:value />
```

**Migration required for**: List, Tree, Accordion, NestedList (currently use `items`)

### 3. Remove `using` Prop, Use Snippets

The deprecated `using` prop for component overrides will be removed. Use snippets instead:

```svelte
<!-- Old (deprecated) -->
<List options={data} using={{ item: CustomItem }} />

<!-- New (standard) -->
<List options={data}>
  {#snippet child(node)}
    <CustomItem data={node} />
  {/snippet}
</List>
```

### 4. Rename and Merge bits-ui Package

- Rename `@rokkit/bits-ui` to `@rokkit/composables` (see [ADR-002](./002-package-rename.md))
- Merge useful components into `@rokkit/ui` over time
- Keep bits-ui as an internal dependency for complex a11y patterns

**Useful patterns to preserve**:
- GroupedList - works well with bits-ui Command
- FloatingNav - good Intersection Observer pattern
- bits-ui's focus management and ARIA handling

### 5. bits-ui Usage Strategy

Use bits-ui as a base for:
- Dialog/Modal (focus trap, portal, escape handling)
- Popover/Tooltip (positioning)
- Combobox/Autocomplete (complex keyboard + filtering)
- DropdownMenu (nested menus)

Build custom for:
- Tree, NestedList, Accordion (hierarchical - no bits-ui equivalent)
- List, Select, MultiSelect (selection - need full control)
- Tabs (simple enough, better as custom)
- Form inputs (CheckBox, Toggle, Range, Rating)

### 6. Learn from bits-ui, Incorporate into Custom Actions

The `@rokkit/actions` navigation system is already well-designed. Enhance it with:
- Scroll-to-active on value binding
- RTL support exposure in components
- Virtualization support
- Enhanced tree navigation (sibling/parent movement)

## Consequences

### Positive
- Clearer architecture with single source of truth
- Easier testing with custom implementations
- Consistent API across all components
- Reduced bundle size (no duplicate implementations)

### Negative
- Migration effort for existing users (options vs items)
- Need to maintain complex a11y patterns ourselves
- bits-ui updates won't automatically benefit custom components

### Neutral
- bits-ui remains as dependency for specific complex components
- Package rename requires documentation updates

## Implementation Plan

### Phase 1: API Standardization
- [ ] Rename `items` to `options` in List, Tree, Accordion, NestedList
- [ ] Remove `using` prop from all components
- [ ] Update all documentation and examples

### Phase 2: Package Consolidation
- [ ] Rename `@rokkit/bits-ui` to `@rokkit/composables` (see [ADR-002](./002-package-rename.md))
- [ ] Move Switch from composables to `@rokkit/ui`
- [ ] Deprecate TabGroup (use ui/Tabs instead)
- [ ] Keep GroupedList, FloatingNav in composables

### Phase 3: Navigation Enhancements
- [ ] Add scroll-to-active on value binding
- [ ] Expose RTL support in List/Tree/Tabs
- [ ] Add virtualization support to navigator
- [ ] Enhance tree navigation (sibling/parent keys)

## Related

- [Component Inventory](../design/component-inventory.md)
- [Component Status Matrix](../design/component-status.md)
- `.rules/project/progress.md` - Implementation tracking
