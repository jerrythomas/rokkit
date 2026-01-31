# Design Documentation

> Architecture, component status, and design decisions for Rokkit UI

## Overview

This section documents how components are built, their current implementation status, and architectural decisions.

## Documents

| Document | Description | Status |
|----------|-------------|--------|
| [project-status.md](./project-status.md) | Overall project health and progress | ❌ |
| [component-status.md](./component-status.md) | 9-dimension status matrix for all components | ❌ |
| [component-inventory.md](./component-inventory.md) | Complete listing of all components | ❌ |
| [architecture.md](./architecture.md) | System architecture and package structure | ❌ |
| [theme-system-design.md](./theme-system-design.md) | Theme implementation details | ❌ |
| [forms-design.md](./forms-design.md) | Forms system architecture | ❌ |

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

### Status Indicators

| Icon | Meaning |
|------|---------|
| ✅ | Complete |
| 🟡 | Partial / In Progress |
| ❌ | Missing / Not Started |
| 🚫 | Not Applicable |

## Package Architecture

```
rokkit/
├── packages/
│   ├── core/          # Core utilities, field mapping
│   ├── states/        # State management, Proxy system
│   ├── ui/            # Main UI components (57+)
│   ├── bits-ui/       # Data-driven wrappers (7)
│   ├── forms/         # Form system
│   ├── actions/       # Svelte actions
│   ├── data/          # Data utilities
│   ├── themes/        # CSS themes
│   └── ...
└── sites/
    └── learn/         # Documentation site
```

## Key Design Patterns

### Data-Driven Components

```svelte
<List items={users} fields={{ text: 'fullName', image: 'avatar' }} />
```

### Composable Flexibility

```svelte
<List {items}>
  {#snippet child(node)}
    <MyCustomComponent data={node.value} />
  {/snippet}
</List>
```

### bits-ui Integration

Components wrap bits-ui primitives while preserving Rokkit's data-driven API:
- Maintain field mapping support
- Preserve snippet customization
- Add data-attribute theming

## Related

- [Requirements](../requirements/) - What components must do
- [Plan](../plan/) - Implementation roadmap
- [.rules/architecture/](../../.rules/architecture/) - Architecture guidelines
