# Rokkit-Specific External Integration Patterns

## bits-ui Integration Strategy

### Reference Implementation

See `packages/bits-ui/src/List.svelte` for the actual implementation pattern using:

- `Command` component from bits-ui
- `Proxy` system from `@rokkit/states`
- Snippet-based rendering with default fallbacks

### Key Integration Constraints

- **Proxy System**: Use `@rokkit/states` Proxy instead of FieldMapper for data handling
- **bits-ui Command**: List component built on Command primitive for search/selection
- **API Compatibility**: Rokkit props (items, value, fields) must work identically
- **Event Translation**: Convert between bits-ui Command events and Rokkit patterns
- **Snippet Support**: Default snippets with user override capability

## Data-Attribute Styling System

### Component Data Attribute Pattern

Components use data attributes for styling hooks. See actual implementations:

- `packages/bits-ui/src/List.svelte` - shows bits-ui Command data attributes
- bits-ui components provide their own data attribute patterns
- Custom components should follow similar patterns

### Theme Layer Integration

See project's `uno.config.js` for actual UnoCSS configuration.
Theme layers target data attributes, not component internals.

### Theme Application Pattern

Themes applied via body data attributes:

- `data-style="rokkit|material|minimal"` - Visual theme
- `data-mode="light|dark"` - Color mode
- `data-density="compact|cozy|loose"` - Spacing density

Components inherit styling from these body-level data attributes.

### Unstyled Component Pattern

All components have NO internal styling. Data attributes are handled internally by:

- bits-ui components (which provide their own data attribute patterns)
- Custom components (which should follow similar conventions)

See existing component implementations for patterns.

## Proxy System Integration

### Required Import Pattern

See `packages/bits-ui/src/List.svelte` for the actual Proxy usage pattern.

Key points:

- Import `Proxy` from `@rokkit/states`
- Create proxy items: `items.map(item => new Proxy(item, fields))`
- Use `.get()`, `.has()`, `.id` methods for data access

### Proxy System Constraints

- **Required for data components**: Use Proxy for consistent data access patterns
- **Runtime flexibility**: Field mappings can change dynamically through Proxy
- **Consistent API**: Proxy provides `.get()`, `.has()`, `.id` methods
- **Built-in ID generation**: Proxy automatically handles item identification

## Accessibility Integration Requirements

### WCAG 2.1 AA Compliance Pattern

bits-ui components handle most accessibility concerns automatically.
For custom components, ensure:

- Proper ARIA roles and attributes
- Keyboard navigation support
- Focus management
- Screen reader compatibility

See bits-ui documentation for specific accessibility patterns.

### Data Attribute Conventions (Internal)

- **Root elements**: `data-{component}-root`
- **Sub-elements**: `data-{component}-{element}`
- **State attributes**: `data-{state}={boolean}`
- **Enum attributes**: `data-{property}={value}`

**Note**: These are handled internally by components. bits-ui provides these patterns, or we implement equivalent ones.

### Theme Layer Structure

Theme files target data attributes, not classes. Structure:

- Base: No styling by default
- Theme layers: `[data-style="theme-name"] [data-component-root]`
- Mode variations: `[data-mode="dark|light"]`
- Density: `[data-density="compact|cozy|loose"]`

See theme packages for actual implementations.

### Keyboard Navigation Standard

- **Arrow Keys**: Up/Down navigation in lists and trees
- **Enter/Space**: Activation and selection
- **Escape**: Close dropdowns and modals
- **Home/End**: First/last item navigation
- **Tab**: Focus management between components

## Performance Integration Patterns

### Virtual Scrolling Threshold

Use virtual scrolling for datasets > 100 items.
Check existing Table component implementation for virtual scrolling patterns.

### Bundle Size Constraints

- **Component chunking**: Each component must be tree-shakeable
- **bits-ui selective imports**: Only import needed components
- **CSS variable usage**: Avoid bundling unnecessary styles

## Testing Integration Requirements

## Testing Integration Requirements

### Component Testing Pattern

Standard tests for all Rokkit components should verify:

- Field mapping via Proxy system works
- Data attributes are applied correctly
- Accessibility attributes are present
- Snippet rendering works as expected

See existing component test files for actual test patterns.

### Critical Dependencies

### @rokkit/states Integration

- **Proxy**: Required for all data-driven components
- **Consistent data access**: `.get()`, `.has()`, `.id` methods
- **Field mapping**: Handles field mapping through constructor

### bits-ui Selective Usage

- Only integrate components that enhance accessibility
- Maintain Rokkit API surface over bits-ui patterns
- Use wrapper pattern to preserve field mapping

### Performance Dependencies

- Virtual scrolling for large datasets (threshold: 100+ items)
- CSS variables for runtime theming
- Tree-shaking for optimal bundle size

## Integration Anti-Patterns

## Integration Anti-Patterns

### Avoid These Patterns

- Using CSS classes for component structure instead of data attributes
- Adding internal component styles (components should be unstyled)
- Skipping Proxy system for data components (assumes data structure)
- Exposing data attributes to snippet users (implementation detail)

### Correct Rokkit Patterns

- Handle data attributes internally in components
- Keep components completely unstyled (only data attributes + user classes)
- Keep snippets focused on content, not implementation details
- Let components handle data attributes + accessibility
- Use Proxy system for all data access

See `packages/bits-ui/src/List.svelte` for reference implementation.
