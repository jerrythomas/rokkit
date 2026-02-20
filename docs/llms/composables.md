# @rokkit/composables

> Composable UI components built on bits-ui.
>
> **Status**: Proposed for removal per [ADR-003](../decisions/003-mvc-separation.md).

## Position in Dependency Hierarchy
**Depends on**: @rokkit/core, @rokkit/states, bits-ui, ramda
**Depended on by**: @rokkit/forms (InputSwitch — broken), sites/learn (Sidebar)

## Exports

| Export | Lines | bits-ui | Description |
|--------|-------|---------|-------------|
| `List` | 96 | Command | Searchable command list |
| `GroupedList` | 130 | Command | Grouped list with headers |
| `Switch` | 32 | Switch | Boolean toggle wrapper |
| `TabGroup` | 117 | Tabs | Tab navigation (commented out in exports) |

## Why Removal is Planned

| Composable | @rokkit/ui Equivalent | Status |
|-----------|----------------------|--------|
| List | ui/List (525 lines, superior) | Redundant |
| GroupedList | ui/List handles groups | Redundant |
| Switch | None yet (recreate as 32-line custom) | Only consumer is broken |
| TabGroup | Not exported, unused | Dead code |

**Only real consumer**: sites/learn Sidebar uses GroupedList (trivially replaced by ui/List).

## Migration Path (ADR-003)

1. Replace `GroupedList` in sites/learn with `@rokkit/ui` List
2. Fix InputSwitch in forms (backlog #1)
3. Remove `@rokkit/composables` dependency from forms
4. Delete package

See [ADR-003](../decisions/003-mvc-separation.md) for full plan.
