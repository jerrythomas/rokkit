# Requirements Documentation

> Specifications and standards for Rokkit UI components

## Numbering Convention

Files use `NNN-name.md` numbering grouped by component category:

| Range | Category | Description |
|-------|----------|-------------|
| 000 | Foundation | Cross-cutting standards, API patterns, RTL |
| 001–009 | UI Components | Button, List, Tree, Table, Select, Menu, Toggle, Toolbar, Navigation |
| 010–019 | Forms | FormRenderer, inputs, validation, lookups |
| 020–029 | Charts | Chart system |
| 030–039 | Themes | Theme system, styling |
| 040–049 | Layout | Card, Panel, Overlay, Grid, Carousel |
| 050–059 | Feedback | ProgressBar, Message, Pill, Separator, Accordion |
| 060–069 | Effects | Tilt, Shine, Glow, Motion |
| 070–079 | Data Components | SearchFilter, Calendar |
| 080–089 | CLI/Tooling | CLI integration |

Gaps are intentional — they leave room for future docs without renumbering.

## Documents

### Foundation (000)

| # | Document | Description |
|---|----------|-------------|
| 000 | [project-overview](./000-project-overview.md) | Vision, cross-cutting requirements (llms.txt, showcase, palette), success criteria |
| 000 | [patterns](./000-patterns.md) | Type system, architecture patterns, TypeScript strategy |
| 000 | [rtl](./000-rtl.md) | RTL detection, Vibe direction, cross-cutting |

### UI Components (001–009)

| # | Document | Description |
|---|----------|-------------|
| 001 | [button](./001-button.md) | Button, ButtonGroup, FloatingAction |
| 002 | [list](./002-list.md) | List with grouping, selection, keyboard nav |
| 003 | [tree](./003-tree.md) | Tree with expand/collapse, connectors, keyboard nav |
| 004 | [table](./004-table.md) | Table with sorting, filtering, TreeTable |
| 005 | [select](./005-select.md) | Select, MultiSelect, DropDown, DropSearch |
| 006 | [menu](./006-menu.md) | Menu with groups, shortcuts |
| 007 | [toggle](./007-toggle.md) | Toggle, Switch, CheckBox, RadioGroup |
| 008 | [toolbar](./008-toolbar.md) | Toolbar, ToolbarGroup |
| 009 | [navigation](./009-navigation.md) | Tabs, BreadCrumbs, Stepper, PageNavigator |

### Forms (010–019)

| # | Document | Description |
|---|----------|-------------|
| 010 | [form](./010-form.md) | FormRenderer, FormBuilder, inputs, validation, lookups, master-detail, semantic input |

### Charts (020–029)

| # | Document | Description |
|---|----------|-------------|
| 020 | [chart](./020-chart.md) | AnimatedChart, accessible patterns, Plot architecture |

### Layout (040–049)

| # | Document | Description |
|---|----------|-------------|
| 040 | [layout](./040-layout.md) | Card, Panel, Overlay, ResponsiveGrid, Carousel, SlidingColumns |

### Feedback & Display (050–059)

| # | Document | Description |
|---|----------|-------------|
| 050 | [feedback](./050-feedback.md) | ProgressBar, Message, Pill, Separator, Summary, Icon, Link, Accordion |

### Effects (060–069)

| # | Document | Description |
|---|----------|-------------|
| 060 | [effects](./060-effects.md) | Tilt, Shine, Glow, Depth3D, Motion, Parallax |

### Data Components (070–079)

| # | Document | Description |
|---|----------|-------------|
| 070 | [data](./070-data.md) | SearchFilter, Calendar |

### CLI/Tooling (080–089)

| # | Document | Description |
|---|----------|-------------|
| 080 | [cli](./080-cli.md) | CLI scaffolding, svelte-add support |

## Related

- [Design Documentation](../design/) — How components are built
- [Component Status](../design/000-component-status.md) — Implementation tracking
- [Package Reference](../llms/) — API reference for all packages
- [Architecture Decisions](../decisions/) — ADRs
