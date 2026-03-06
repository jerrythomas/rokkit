# Features

Rokkit is a Svelte 5 component library built around a single conviction: **data should drive the interface**. Developers should be able to drop in components, point them at existing data, and get a polished, accessible UI — without transforming data, without rewriting render logic, and without fighting the design system.

## Vision

- **Data-First** — Components adapt to any data structure through field mapping. No preprocessing, no transformation. Pass data as-is and the component figures it out.
- **Composable** — Every visual part of every component can be replaced via snippets. Custom rendering without forking components or working around them.
- **Consistent API** — All selection components share the same props: `items`, `value`, `fields`, `onchange`. One pattern to learn, works everywhere.
- **Accessible by Default** — Keyboard navigation, ARIA attributes, focus management, and screen reader support built into every component. No configuration required.
- **Themeable** — Unstyled core with data-attribute hooks. Plug in any theme, any design system. Full control from CSS alone.
- **Cohesive Design System** — First-party themes with dark/light/system mode support, semantic color palettes (skins), typography scales, variants, and data-density controls. Whitelabeling out of the box.
- **Schema-Driven Forms** — Generate complete, validated forms from JSON schema. Fully integrated with the component library for consistent keyboard behavior, theming, and dynamic lookups.
- **Charts** — Sparklines and animated chart components with theme and pattern support. Accessible and interactive out of the box.
- **Developer Utilities** — Low-level primitives for state management and interactions. Build your own components on top of Rokkit's foundation.
- **Toolchain** — CLI to add and upgrade Rokkit, curated icon sets, and tools to roll your own skins and theme styles.
- **Documentation** — Visual examples, AI-readable references, and interactive playgrounds for every component.

## Modules

- [Data Binding](01-DataBinding.md) — Data adapts to components, not the other way around
- [Composability](02-Composability.md) — Extend any component via snippets without modifying it
- [Theming & Design](03-ThemingAndDesign.md) — Visual system: themes, skins, variants, density, whitelabeling
- [Accessibility & Internationalization](04-AccessibilityAndI18n.md) — Keyboard navigation, ARIA, tooltips, i18n
- [Forms](05-Forms.md) — Schema-driven form generation, validation, and dynamic lookups
- [Component Library](06-ComponentLibrary.md) — Pre-built component set with consistent API
- [Charts](07-Charts.md) — Sparklines, animated charts, pattern fills, accessible and interactive
- [Developer Utilities](08-DeveloperUtilities.md) — State management, actions, and primitives for custom components
- [Toolchain](09-Toolchain.md) — CLI, icon sets, custom skins and theme styles

## Feature Status

| Module | Feature | Status |
|--------|---------|--------|
| Data Binding | Default field conventions (`text`, `value`, `icon`, `children`) | ✅ Implemented |
| | Custom field mapping | ✅ Implemented |
| | Nested field access via dot paths | ✅ Implemented |
| | Per-item field overrides | ✅ Implemented |
| | No data transformation required | ✅ Implemented |
| | Consistent component API | ✅ Implemented |
| Composability | Custom item rendering via snippets | ✅ Implemented |
| | Named snippets for mixed item types | ✅ Implemented |
| | Partial snippet overrides | ✅ Implemented |
| | Empty state snippets | ✅ Implemented |
| | Icon overrides | ✅ Implemented |
| | Snippet data access via ProxyItem | ✅ Implemented |
| Theming & Design | Data-attribute styling hooks | ✅ Implemented |
| | Theme/layout CSS separation | ✅ Implemented |
| | CSS variable integration | ✅ Implemented |
| | Dark / light / system mode | ✅ Implemented |
| | Semantic color palettes (skins) | ✅ Implemented |
| | Component variants | ✅ Implemented |
| | Typography scale | ✅ Implemented |
| | Data-density controls | 🔲 Planned |
| | Whitelabeling | 🔲 Planned |
| Accessibility & i18n | Keyboard navigation | ✅ Implemented |
| | ARIA attributes | ✅ Implemented |
| | Focus management and trapping | ✅ Implemented |
| | Screen reader support | ✅ Implemented |
| | Tooltips | 🔲 Planned |
| | Internationalization (i18n) | 🔲 Planned |
| Forms | JSON schema to form | ✅ Implemented |
| | Field types (text, number, boolean, enum, array) | ✅ Implemented |
| | Nested structures and object sections | ✅ Implemented |
| | Custom field rendering | ✅ Implemented |
| | Form state management (dirty, reset, submit) | ✅ Implemented |
| | Validation | ✅ Implemented |
| | Dynamic lookups | ✅ Implemented |
| | Conditional fields | 🔲 Planned |
| | Multi-step forms | 🔲 Planned |
| Component Library | Selection (List, Select, MultiSelect, Tree) | ✅ Implemented |
| | Navigation (Tabs, Menu, Toolbar) | ✅ Implemented |
| | Inputs (Input, CheckBox, Toggle, Switch) | ✅ Implemented |
| | Overlay (Dropdown, Popover) | ✅ Implemented |
| | Cards | 🚧 In Progress |
| | Layout components | 🔲 Planned |
| | Data table | 🔲 Planned |
| Charts | Sparklines | ✅ Implemented |
| | Animated charts | 🔲 Planned |
| | Pattern fills | 🔲 Planned |
| | Interactive (hover, click, drill-down) | 🔲 Planned |
| | Accessible chart data (ARIA, table fallback) | 🔲 Planned |
| Developer Utilities | ProxyItem (field access abstraction) | ✅ Implemented |
| | ListController / NestedController | ✅ Implemented |
| | Navigator action (keyboard nav primitive) | ✅ Implemented |
| | Interaction actions (ripple, hover-lift, magnetic) | ✅ Implemented |
| Toolchain | CLI: add/upgrade Rokkit | 🔲 Planned |
| | Icon sets | 🔲 Planned |
| | Skin customization via CLI | 🔲 Planned |
| | Custom theme style authoring | 🔲 Planned |
