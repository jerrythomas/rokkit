# Design Documentation

Architecture, component design, and implementation details for Rokkit UI.

## Core Design Documents

These documents define how Rokkit works. Read them before designing or building anything.

| Document | Description |
|----------|-------------|
| [Patterns](./01-patterns.md) | **Core patterns** — data binding, field mapping, API conventions, theming, accessibility. Reference for all component work. |
| [Components](./02-components.md) | Component anatomy, categories, data flow, snippet model, overlay design |
| [Forms](./03-forms.md) | Schema-driven form system: FormBuilder, field types, validation, lookups |
| [Actions](./04-actions.md) | navigator action, interaction actions (ripple, hover-lift, magnetic) |
| [Website](./05-website.md) | Learn site architecture, docs pages, playground, llms.txt, navigation |
| [Testing](./06-testing.md) | Testing strategy: unit tests (Vitest), E2E tests (Playwright), conventions |
| [Tools](./07-tools.md) | CLI, icon sets, toolchain *(planned)* |
| [Data](./08-data.md) | `@rokkit/data` package: dataset pipeline, rollup, dataview, filtering, formatting, schema inference, joins |
| [Theming](./09-theming.md) | Theme architecture: skin system, z-index scale, CSS variables, runtime switching |
| [Charts](./10-charts.md) | Charts |
| [Inventory](./11-inventory.md) | Component inventory |
| [Priority](./12-priority.md) | Priority checklist — all pending work items by tier |

## Component Status Dimensions

All components are evaluated across 9 dimensions:

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

- [Features](../features/) — Feature specs and vision
