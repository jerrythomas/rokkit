# @rokkit/composables

> Composable UI components built on bits-ui.
>
> **Status**: Pending removal per [ADR-003](../decisions/003-mvc-separation.md). Phase A complete — no consumers remain.

## Position in Dependency Hierarchy
**Depends on**: @rokkit/core, @rokkit/states, bits-ui, ramda
**Depended on by**: None (all consumers migrated)

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
| Switch | ui/Toggle (used by forms/InputSwitch) | Replaced |
| TabGroup | Not exported, unused | Dead code |

## Migration Status (ADR-003 Phase A — Complete)

1. ~~Replace `GroupedList` in sites/learn with `@rokkit/ui` List~~ — Done
2. ~~Fix InputSwitch in forms~~ — Done (now uses `@rokkit/ui` Toggle)
3. ~~Remove `@rokkit/composables` dependency from forms~~ — Done
4. Delete package — ADR-003 Phase D (pending)

See [ADR-003](../decisions/003-mvc-separation.md) for full plan.
