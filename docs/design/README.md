# Design Documentation

Architecture, component design, and implementation details for Rokkit UI.

## Core Design Documents

These documents define how Rokkit works. Read them before designing or building anything.

| Document                            | Description                                                                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| [01-patterns](./01-patterns.md)     | **Core patterns** — data binding, field mapping, API conventions, theming, accessibility. Reference for all component work. |
| [02-components](./02-components.md) | Component anatomy, categories, data flow, snippet model, overlay design                                                     |
| [03-forms](./03-forms.md)           | Schema-driven form system: FormBuilder, field types, validation, lookups                                                    |
| [04-actions](./04-actions.md)       | navigator action, interaction actions (ripple, hover-lift, magnetic)                                                        |
| [09-website](./09-website.md)       | Learn site architecture, docs pages, playground, llms.txt, navigation                                                       |
| [06-testing](./06-testing.md)       | Testing strategy: unit tests (Vitest), E2E tests (Playwright), conventions                                                  |
| [07-priority](./07-priority.md)     | Priority checklist — all pending work items by tier                                                                         |
| [08-tools](./08-tools.md)           | CLI, icon sets, toolchain _(planned)_                                                                                       |
| [09-data](./09-data.md)             | `@rokkit/data` package: dataset pipeline, rollup, dataview, filtering, formatting, schema inference, joins                  |
| [10-theming](./10-theming.md)       | Theme architecture: skin system, z-index scale, CSS variables, runtime switching                                            |

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
