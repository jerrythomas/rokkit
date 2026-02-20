# Design Documentation

> Architecture, component design, and implementation details for Rokkit UI

## Numbering Convention

Files use `NNN-name.md` numbering grouped by component category:

| Range | Category | Description |
|-------|----------|-------------|
| 000 | Foundation | Architecture, inventory, status, patterns |
| 001–009 | UI Components | Button, List, Tree, Table, Select, Menu, Toggle, Toolbar, Navigation |
| 010–019 | Forms | FormRenderer, FormBuilder, inputs, validation |
| 020–029 | Charts | Chart system |
| 030–039 | Themes | Theme system, styling |
| 040–049 | Layout | Card, Panel, Overlay, Grid, Carousel |
| 050–059 | Feedback | ProgressBar, Message, Pill, Separator, Accordion |
| 060–069 | Effects | Tilt, Shine, Glow, Motion |
| 070–079 | Data Components | SearchFilter, Calendar |
| 080–089 | CLI/Tooling | CLI integration |

## Documents

### Foundation (000)

| Document | Description |
|----------|-------------|
| [000-architecture](./000-architecture.md) | Package hierarchy, type system, state management |
| [000-navigation](./000-navigation.md) | Navigation system, `use:navigator` action |
| [000-component-inventory](./000-component-inventory.md) | Complete listing of all components |
| [000-component-status](./000-component-status.md) | 9-dimension status matrix |
| [000-component-gaps](./000-component-gaps.md) | Gap analysis across components |
| [000-component-approach](./000-component-approach.md) | Component approach patterns |

### UI Components (001–009)

| # | Document | Description |
|---|----------|-------------|
| 001 | button | *Planned* |
| 002 | [list](./002-list.md) | Current architecture + `use:navigator` + controller refactor |
| 003 | [tree](./003-tree.md) | Current architecture + `use:navigator` + NestedController refactor |
| 004 | [table](./004-table.md) | Table with TabularController, SearchFilter, sorting |
| 005 | select | *Planned* |
| 006 | menu | *Planned* |
| 007 | toggle | *Planned* |
| 008 | toolbar | *Planned* |

### Forms (010–019)

| # | Document | Description |
|---|----------|-------------|
| 010 | [form](./010-form.md) | FormBuilder, type registry, validation, lookups, master-detail, semantic command |

### Charts (020–029)

*Planned*

### Themes (030–039)

| # | Document | Description |
|---|----------|-------------|
| 030 | [theme](./030-theme.md) | Theme system implementation |

## Component Status Matrix

Components are evaluated across 9 dimensions:

| # | Dimension | Description |
|---|-----------|-------------|
| 1 | Data Attributes | All elements have `data-*` attributes for theming |
| 2 | Keyboard | Full keyboard navigation support |
| 3 | Mouse/Touch | Mouse and touch interactions work correctly |
| 4 | ARIA | Proper ARIA roles, states, properties |
| 5 | Rokkit Theme | Styled in Rokkit theme |
| 6 | Minimal Theme | Styled in Minimal theme |
| 7 | Material Theme | Styled in Material theme |
| 8 | Dark/Light Mode | Works in both color modes |
| 9 | Stories | Complete tutorial examples |

## Related

- [Requirements](../requirements/) — What components must do
