# ADR-003: MVC Separation — Fold Composables, Adopt Actions/States in UI

**Status**: Proposed
**Date**: 2026-02-20
**Supersedes**: ADR-001 Phase 2 (partial), ADR-002 (composables as separate package)

## Context

ADR-001 decided to focus on custom implementations in `@rokkit/ui` and eventually merge composables. ADR-002 renamed `@rokkit/bits-ui` to `@rokkit/composables`. Since then, two problems have become clear:

### Problem 1: @rokkit/composables Has No Reason to Exist

| Composable | UI equivalent | Status |
|-----------|---------------|--------|
| List (96 lines, bits-ui Command) | ui/List (525 lines, custom) | UI version is superior |
| GroupedList (130 lines) | ui/List handles groups natively | Redundant |
| Switch (32 lines, bits-ui) | None in ui | Thin wrapper, only consumer is broken InputSwitch |
| TabGroup (117 lines) | Not exported, commented out | Unused |
| Tree (81 lines) | ui/Tree (472 lines, custom) | UI version is superior |
| FloatingNav | Commented out, not exported | Dead code |

**Only real consumer**: `sites/learn` Sidebar imports `GroupedList` (trivially replaced by ui/List).

### Problem 2: @rokkit/ui Reimplements Logic That Already Exists

`@rokkit/ui` currently depends only on `@rokkit/core`. It does **not** use `@rokkit/states` or `@rokkit/actions`. Instead, each component reimplements the same patterns inline:

| Duplicated logic | Archive pattern | Current ui pattern | Occurrences |
|-----------------|-----------------|---------------------|-------------|
| Flat item calculation | `ListController.data` | Manual `flatItems` / `visibleIndices` | List, Select, Menu, Tree |
| Focus state | `wrapper.focusedKey` | Manual `focusedIndex` / `focusedPath` | List, Select, Menu, Tree |
| Navigate next/prev/first/last | `wrapper.moveNext()` etc. | Manual index math in switch statements | List, Select, Menu, Tree |
| Keyboard handling | `navigator` action (~50 lines, shared) | Per-component handlers (35–107 lines each) | List, Select, Menu, Tree |
| Tree flattening + expand/collapse | `NestedController` | Manual `flattenTree()` + toggle functions | Tree |
| Field mapping | `@rokkit/states.Proxy` | `@rokkit/ui.ItemProxy` (parallel implementation) | All data-driven components |

**Estimated duplication**: ~1200 lines across 4 components → ~200 lines of shared code.

### The Archive Had It Right

The archived `Tabs.svelte` demonstrates clean MVC separation:

```
Model      → @rokkit/states (ListController, Proxy)
Controller → @rokkit/actions (navigator)
View       → Component .svelte file (markup + snippets)
```

Current ui components are monolithic — each one handles model, controller, and view internally. This creates:
- Inconsistent keyboard behavior (subtle differences per component)
- Higher maintenance burden (bug fixes in 4+ places)
- Larger bundle (same logic shipped multiple times)
- Harder to add cross-cutting features (RTL support requires touching every component)

## Decision

### 1. Remove @rokkit/composables

Delete the package entirely. Migration:

| Consumer | Change |
|----------|--------|
| `sites/learn` Sidebar | Replace `GroupedList` with `@rokkit/ui` `List` |
| `@rokkit/forms` InputSwitch | Replace with custom Switch in `@rokkit/ui` (backlog #1) |
| `@rokkit/forms` package.json | Remove `@rokkit/composables` dependency |

### 2. Remove bits-ui From the Project

- `@rokkit/composables` is the only actual consumer
- `@rokkit/chart` lists bits-ui as dependency but **never imports it** — dead dependency
- After removing composables and cleaning chart, bits-ui is gone

### 3. Add @rokkit/states and @rokkit/actions as Dependencies of @rokkit/ui

```
@rokkit/core          ← foundation (no change)
  ↑
@rokkit/states        ← Proxy, ListController, NestedController (no change)
  ↑
@rokkit/actions       ← navigator, keyboard, dismissable (no change)
  ↑
@rokkit/ui            ← NOW depends on states + actions (was: core only)
```

**Why separate packages instead of moving source into ui:**
- `@rokkit/states` and `@rokkit/actions` have independent utility (forms uses states, archived components use actions)
- Keeps each package focused and testable
- Tree-shaking eliminates unused code for consumers regardless of package boundaries
- Other packages (forms, future packages) can depend on states/actions without depending on ui

### 4. Migrate UI Components to Use Shared Logic

Refactor each component to use `ListController`/`NestedController` + `navigator`:

**Before** (current monolithic pattern):
```svelte
<script>
  // 40 lines: manual flatItems calculation
  // 15 lines: manual focus state
  // 50 lines: manual keyboard handler
  // 20 lines: manual scroll-to-focus
</script>
```

**After** (MVC pattern):
```svelte
<script>
  import { ListController } from '@rokkit/states'
  import { navigator } from '@rokkit/actions'

  let controller = new ListController(options, value, fields)
  // controller.data = flat visible items (derived)
  // controller.focusedKey = current focus (reactive)
  // controller.moveNext(), select(), etc.
</script>

<div use:navigator={{ wrapper: controller, orientation }}>
  {#each controller.data as item}
    <!-- just rendering -->
  {/each}
</div>
```

**Migration order** (by complexity):
1. Toggle — simplest, no hierarchy
2. Menu — flat list with dropdown
3. Select / MultiSelect — flat list with dropdown + selection binding
4. List — flat + grouped, collapsible groups
5. Toolbar — flat with sections
6. Tree — hierarchical, uses NestedController

### 5. Unify Proxy / ItemProxy

`@rokkit/states.Proxy` and `@rokkit/ui.ItemProxy` implement the same pattern. Consolidate:
- Keep `Proxy` in `@rokkit/states` as the single implementation
- Remove `ItemProxy` from ui (or make it a re-export/alias during migration)
- Update all ui components to use `Proxy`

## Consequences

### Positive
- ~1200 lines of duplication eliminated
- Consistent keyboard navigation across all components
- Cross-cutting features (RTL, virtualization) implemented once
- Single place to fix keyboard/focus bugs
- Each component becomes purely a rendering concern (~150–200 lines)
- bits-ui removed entirely — no external UI framework dependency
- Smaller bundle through shared code + tree-shaking

### Negative
- Migration effort for 6+ components
- @rokkit/ui gains two new dependencies (states, actions)
- Must ensure ListController/navigator APIs cover all component needs (may need enhancements)

### Neutral
- Tree-shaking means consumers only pay for what they use regardless
- Package dependency graph gets one level deeper for ui

## Tree-Shaking Analysis

Consumer imports `List` only:
```
Included: List.svelte + ListController + Proxy + navigator
Excluded: Tree, Select, Menu, NestedController, keyboard, dismissable, etc.
```

Consumer imports `List` + `Tree`:
```
Included: List.svelte + Tree.svelte + ListController + NestedController + Proxy + navigator
Excluded: Select, Menu, keyboard, dismissable, etc.
```

Vite/Rollup tree-shakes at the ES module level. Unused exports from `@rokkit/states` and `@rokkit/actions` are eliminated. The package boundary is irrelevant to bundle size.

## Implementation Plan

### Phase A: Clean Up (No Breaking Changes)
- [ ] Remove bits-ui from `@rokkit/chart` package.json
- [ ] Remove `@rokkit/composables` dependency from `@rokkit/forms` package.json
- [ ] Fix InputSwitch to not import from composables (backlog #1)
- [ ] Replace `GroupedList` in sites/learn Sidebar with ui/List

### Phase B: Add Dependencies to UI
- [ ] Add `@rokkit/states` and `@rokkit/actions` to ui package.json dependencies
- [ ] Verify build and tests pass with new dependencies

### Phase C: Migrate Components (One at a Time)
- [ ] Migrate Toggle to use ListController
- [ ] Migrate Menu to use ListController + navigator
- [ ] Migrate Select to use ListController + navigator
- [ ] Migrate MultiSelect
- [ ] Migrate List to use ListController + navigator
- [ ] Migrate Toolbar
- [ ] Migrate Tree to use NestedController + navigator
- [ ] Unify Proxy/ItemProxy — replace ItemProxy with states.Proxy

### Phase D: Remove Composables
- [ ] Delete `packages/composables/`
- [ ] Remove from workspace configuration
- [ ] Update all documentation references

## Related

- [ADR-001: Component Architecture Strategy](./001-component-architecture.md)
- [ADR-002: Rename bits-ui to composables](./002-package-rename.md)
- [000-patterns.md](../requirements/000-patterns.md) — component architecture patterns
- [000-architecture.md](../design/000-architecture.md) — system architecture
