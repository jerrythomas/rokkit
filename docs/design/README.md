# Design Documentation

Architecture, component design, and implementation details for Rokkit UI.

## Core Design Documents

These documents define how Rokkit works. Read them before designing or building anything.

| Document                            | Description                                                                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| [01-patterns](./01-patterns.md)     | **Core patterns** — data binding, field mapping, API conventions, theming, accessibility. Reference for all component work. |
| [02-components](./02-components.md) | Component anatomy, categories, data flow, snippet model, overlay design                                                     |
| [03-forms](./03-forms.md)           | Schema-driven form system: FormBuilder, field types, validation, lookups                                                    |
| [04-actions](./04-actions.md)       | Navigator class, interaction actions (ripple, hover-lift, magnetic)                                                         |
| [05-website](./05-website.md)       | Learn site architecture, docs pages, playground, llms.txt, navigation                                                       |
| [06-testing](./06-testing.md)       | Testing strategy: unit tests (Vitest), E2E tests (Playwright), conventions                                                  |
| [08-data](./08-data.md)             | `@rokkit/data` package: dataset pipeline, rollup, dataview, filtering, formatting, schema inference, joins                  |
| [09-theming](./09-theming.md)       | Theme architecture: skin system, CSS variables, runtime switching                                                          |
| [10-themes](./10-themes.md)         | Theme system design: `data-style`, CSS layer architecture, build pipeline                                                  |
| [11-inventory](./11-inventory.md)   | Component inventory + status across all packages                                                                            |
| [12-priority](./12-priority.md)     | Priority checklist — all pending work items by tier                                                                         |
| [17-skin-system](./17-skin-system.md) | Runtime skin switching: `vibe.skin`, `data-skin`, `skins` config                                                         |
| [20-chart](./20-chart.md) / [22-chart-preset](./22-chart-preset.md) | Chart package (system design) and preset system                  |
| [70-tools](./70-tools.md) / [71-tools](./71-tools.md) | CLI, icon sets, toolchain                                                                              |

> Full index: every numbered doc lives in this directory. Ranges follow the convention below.

## Numbering Convention

| Range | Category                                                                                              |
| ----- | ----------------------------------------------------------------------------------------------------- |
| 01–09 | Core design documents (patterns, components, forms, actions, website, testing, priority, tools, data) |
| 10–19 | Theme system                                                                                          |
| 20–29 | Charts subsystem                                                                                      |
| 30–39 | Layout components                                                                                     |
| 40–49 | Feedback components                                                                                   |
| 50–59 | Effects                                                                                               |
| 60–69 | Data components                                                                                       |
| 70–79 | CLI/Tooling                                                                                           |

## Component Status Dimensions

All components are evaluated across 9 dimensions:

| #   | Dimension       | Description                                       |
| --- | --------------- | ------------------------------------------------- |
| 1   | Data Attributes | All elements have `data-*` attributes for theming |
| 2   | Keyboard        | Full keyboard navigation support                  |
| 3   | Mouse/Touch     | Mouse and touch interactions work correctly       |
| 4   | ARIA            | Proper ARIA roles, states, properties             |
| 5   | Rokkit Theme    | Styled in Rokkit theme                            |
| 6   | Minimal Theme   | Styled in Minimal theme                           |
| 7   | Material Theme  | Styled in Material theme                          |
| 8   | Dark/Light Mode | Works in both color modes                         |
| 9   | Stories         | Complete tutorial examples                        |

## Related

- [Features](../features/) — Feature specs and vision
