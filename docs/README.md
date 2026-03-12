# Rokkit

A Svelte 5 component library built around a single conviction: **data should drive the interface**. Drop in components, point them at existing data, get a polished accessible UI — without transforming data, rewriting render logic, or fighting the design system.

---

## Philosophy

**Data-first.** Components adapt to any data structure through field mapping. No preprocessing, no adapter objects. Pass data as-is; the component figures it out.

**Composable.** Every visual part of every component can be replaced via snippets. Custom rendering without forking components or working around them.

**Consistent.** All selection components share the same props: `items`, `value`, `fields`, `onchange`. One pattern to learn, works everywhere.

**Accessible by default.** Keyboard navigation, ARIA attributes, focus management, and screen reader support are built in. No configuration required.

**Themeable.** Unstyled components with data-attribute hooks. Plug in any theme or design system from CSS alone. First-party themes include dark/light/system mode, semantic color palettes, typography scales, and density controls.

---

## What's in the box

| Area                    | What it does                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------- |
| **Data Binding**        | Field mapping, nested paths, computed fields, per-item overrides                    |
| **Composability**       | Snippet-based extensibility for any rendered part of any component                  |
| **Theming**             | Skin system, CSS variable architecture, dark/light/system mode, component variants  |
| **Accessibility**       | Keyboard navigation via `use:navigator`, ARIA, focus trapping, screen reader labels |
| **Forms**               | Schema-driven form generation, validation, dynamic lookups, custom field types      |
| **Component Library**   | Selection, navigation, input, overlay, cards, layout, data components               |
| **Charts**              | Sparklines, animated charts, coordinated views (CrossFilter), pattern fills         |
| **Developer Utilities** | ListController, NestedController, ProxyItem, ripple/hover-lift/magnetic actions     |
| **Toolchain**           | CLI for setup and upgrade, icon sets, custom skin and theme authoring               |

---

## Documentation

### [Features](features/)

What Rokkit does and why — written as Gherkin scenarios and vision statements. Start here to understand the goals.

- [Data Binding](features/01-DataBinding.md)
- [Composability](features/02-Composability.md)
- [Theming & Design](features/03-ThemingAndDesign.md)
- [Accessibility & i18n](features/04-AccessibilityAndI18n.md)
- [Forms](features/05-Forms.md)
- [Component Library](features/06-ComponentLibrary.md)
- [Charts](features/07-Charts.md)
- [Developer Utilities](features/08-DeveloperUtilities.md)
- [Toolchain](features/09-Toolchain.md)

### [Design](design/)

How Rokkit is built — architecture decisions, patterns, and implementation details.

- [Patterns](design/01-patterns.md) — Core patterns every component follows
- [Components](design/02-components.md) — Component anatomy, data flow, API, snippets
- [Forms](design/03-forms.md) — Schema-driven form system
- [Actions](design/04-actions.md) — Navigator, keyboard, interaction actions
- [Website](design/09-website.md) — Learn site, playground, AI content
- [Testing](design/06-testing.md) — Unit and e2e test design
- [Priority](design/07-priority.md) — What's next
- [Tools](design/08-tools.md) — CLI, icon sets, theme authoring
- [Data](design/09-data.md) — `@rokkit/data` package
- [Theming](design/10-theming.md) — Skin system, color scale, CSS architecture

---

## Learn site

User-facing guides, interactive playground, and AI-readable references are served from the [learn site](../solution/sites/learn/).
