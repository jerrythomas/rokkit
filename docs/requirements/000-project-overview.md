# Project Overview

> Strategic vision, cross-cutting requirements, and success criteria for Rokkit

## Vision

Rokkit is a Svelte 5 component library and design system for data-driven applications. It provides:

1. **Style-Agnostic Components** — core functionality independent of visual design, themed via data attributes
2. **Data-Driven Approach** — components adapt to data structures via field mapping (`items`, `value`, `fields`)
3. **Snippet-Based Customization** — every component extensible via Svelte 5 snippets without modification
4. **Theme Flexibility** — three built-in themes (rokkit, minimal, material) with easy customization
5. **Accessibility First** — keyboard navigation + ARIA via controller + navigator pattern
6. **Developer Experience** — comprehensive documentation, playground demos, and LLM-friendly reference

## Architecture

See [Architecture Design](../design/000-architecture.md) for package hierarchy, type system, and data flow.

### Package Structure
```
packages/
  core/       — Utilities, field mapping, type helpers
  actions/    — Svelte actions (navigator, clickOutside, etc.)
  states/     — Controllers (ListController, NestedController, etc.)
  ui/         — UI components (List, Tree, Select, Menu, etc.)
  forms/      — Schema-driven form rendering + validation
  themes/     — Theme CSS (base, rokkit, minimal, material)
  chart/      — Chart components (AnimatedChart, Plot)
  data/       — Data components (SearchFilter, Calendar)
  helpers/    — Test helpers
```

### Design Principles

- **Data attributes over classes** — themes target `data-*` attributes, not CSS classes
- **Semantic color variables** — no hard-coded colors; components use `--primary`, `--surface`, etc.
- **Behavioral props, visual themes** — component behavior via props, styling via external CSS
- **Theme independence** — components work unstyled; themes are pure enhancement

## Cross-Cutting Requirements

### R1: llms.txt Implementation

Machine-readable reference files for LLM consumption.

**Root-level llms.txt**
- Served at site root — overview of the entire component library
- Component list with descriptions, package locations, API summaries

**Per-component llms.txt**
- URL: `/docs/components/{component-name}/llms.txt`
- Content: description, API (props/events/snippets), usage examples, accessibility features, theme info, common patterns

### R5: Component Showcase Page

Single page displaying all components together with live controls.

- All components visible and interactive simultaneously
- Live theme switching (rokkit, minimal, material)
- Live mode switching (dark, light)
- Organized by component category
- Compact but functional examples with links to full documentation
- Responsive layout (grid on desktop, stack on mobile)

### R6: Palette Designer Tool

Interactive tool for designing custom color systems using color theory.

**Features**:
- Color wheel with harmony rule visualization (complementary, analogous, triadic, split-complementary, monochromatic)
- Base color picker with auto-palette generation
- Semantic role mapping (primary, secondary, accent, success, warning, error, info)
- WCAG contrast checker + color blindness simulation
- Live preview on actual components
- Export as CSS variables, JSON, or theme file

**Named Palettes** (built-in):
- `vibrant` (default) — orange, pink, bold colors
- `sea-green` — ocean-inspired blues and greens
- `monochrome` — grayscale-focused
- `warm` — earth tones
- `cool` — blues and purples
- `custom` — user-defined

## Success Criteria

### Component Completion

A component is **complete** when all applicable dimensions are satisfied:

| Dimension | Criteria |
|-----------|----------|
| Implementation | All functionality, props, events, edge cases, TypeScript types |
| Data Attributes | All elements have state/variant attributes, documented |
| Keyboard/Mouse | Full keyboard nav, mouse interactions, touch-friendly targets |
| ARIA | Correct roles, states, properties; screen reader tested |
| Theme Coverage | Styled in all three themes, all states covered |
| Dark/Light Mode | Both modes look good, sufficient contrast |
| Stories/Playground | Basic usage, variants, states, interactive examples |
| Documentation | API reference, usage guidelines, accessibility notes |
| Tests | Unit + integration tests, >80% coverage, all passing |

See [Component Status](../design/000-component-status.md) for current tracking.

### Forms System Completion

The forms system is **complete** when:

- Schema-driven rendering for all input types
- Validation (built-in + custom + async + cross-field)
- Error display (field-level + form-level + summary)
- Submission workflow (validate → focus error → submit → snapshot)
- Dependent/cascading fields with API integration
- Advanced: field arrays, multi-step, conditional visibility, draft saving

See [Forms Design](../design/010-form.md) for architecture details.

### Theme System Completion

- All components styled in all three themes
- Visual consistency within each theme
- Instant switching with no flash or layout shifts
- Dark/light mode in all themes with automated contrast checks
- Palette system with named palettes + custom palette support

See [Theme Design](../design/030-theme.md) for implementation details.

## Related Documents

| Document | Description |
|----------|-------------|
| [Architecture](../design/000-architecture.md) | Package hierarchy, type system, data flow |
| [Component Status](../design/000-component-status.md) | Per-component status matrix |
| [Component Inventory](../design/000-component-inventory.md) | Full component listing |
| [Component Gaps](../design/000-component-gaps.md) | Gap analysis |
| [Theme Design](../design/030-theme.md) | Theme system architecture |
| [Forms Design](../design/010-form.md) | Forms system architecture |
| [Patterns](./000-patterns.md) | API patterns, type system |
| [RTL](./000-rtl.md) | RTL support requirements |
