# ADR-002: Rename @rokkit/bits-ui to @rokkit/composables

**Status**: Accepted  
**Date**: 2026-01-31  
**Decision Makers**: Project maintainers

## Context

The package `@rokkit/bits-ui` contains composable component primitives that wrap bits-ui. The name has issues:

1. **Confusing**: Implies it's just bits-ui, not Rokkit's value-add
2. **Implementation detail**: Exposes that bits-ui is used internally
3. **Not descriptive**: Doesn't communicate the composable/primitive nature

Additionally, per ADR-001, we're consolidating architecture:
- Data-driven components stay in `@rokkit/ui`
- Composable primitives move to a renamed package
- Some components will migrate between packages

## Decision

Rename `@rokkit/bits-ui` to `@rokkit/composables`.

### Package Structure After Rename

```
@rokkit/ui           → Data-driven components (unchanged)
                       - List, Select, MultiSelect, Tree, Tabs, etc.
                       - Use: <List options={data} bind:value />

@rokkit/composables  → Composable primitives (renamed from bits-ui)
                       - Tree.Root, Tree.Node, Tree.Item, etc.
                       - Use: <Tree.Root><Tree.Node>...</Tree.Node></Tree.Root>
```

### What Goes Where

**@rokkit/ui** (data-driven):
- Components that accept `options` prop and handle data internally
- Use Proxy system for field mapping
- Single component usage: `<List options={data} />`

**@rokkit/composables** (primitives):
- Composable parts for building custom UIs
- Compound component pattern: `<Tree.Root><Tree.Node /></Tree.Root>`
- Maximum flexibility, minimum opinions

### Current @rokkit/bits-ui Components

| Component | Action | Reason |
|-----------|--------|--------|
| List | Keep in composables | Composable list primitive |
| NestedList | Keep in composables | Composable nested primitive |
| Tree | Keep in composables | Composable tree parts |
| Switch | Move to ui | Data-driven pattern fits better |
| TabGroup | Deprecate | Duplicate of ui/Tabs |
| GroupedList | Keep in composables | Useful composable pattern |
| FloatingNav | Keep in composables | Specialized composable |

## Consequences

### Positive
- Clear naming that describes purpose
- No longer exposes bits-ui as implementation detail
- Aligns with ADR-001 architecture strategy
- Room to add more composables not based on bits-ui

### Negative
- Breaking change for existing bits-ui users
- Need to update all imports and documentation

### Migration Path

```javascript
// Before
import { List } from '@rokkit/bits-ui'
import Tree from '@rokkit/bits-ui/tree'

// After
import { List } from '@rokkit/composables'
import Tree from '@rokkit/composables/tree'
```

## Implementation Steps

1. [x] Create `packages/composables/` directory
2. [x] Copy components from `packages/bits-ui/`
3. [x] Update package.json with new name
4. [x] Update all internal imports
5. [ ] Add deprecation notice to bits-ui package
6. [x] Update documentation and examples
7. [ ] Publish both packages (bits-ui with deprecation, composables as new)
8. [ ] Remove bits-ui after transition period

## Related

- [ADR-001: Component Architecture Strategy](./001-component-architecture.md)
- [Component Inventory](../design/component-inventory.md)
