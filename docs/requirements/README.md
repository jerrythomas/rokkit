# Requirements Documentation

> Specifications and standards for Rokkit UI components

## Overview

This section defines what components must do, including functional requirements, accessibility standards, theme compatibility, and documentation expectations.

## Documents

| Document | Description | Status |
|----------|-------------|--------|
| [component-requirements.md](./component-requirements.md) | Standard API patterns and component behavior | ❌ |
| [accessibility-requirements.md](./accessibility-requirements.md) | WCAG 2.1 AA compliance and ARIA standards | ❌ |
| [theme-requirements.md](./theme-requirements.md) | Theme system and dark/light mode support | ❌ |
| [forms-requirements.md](./forms-requirements.md) | Form system schema and validation | ❌ |
| [documentation-requirements.md](./documentation-requirements.md) | llms.txt and documentation standards | ❌ |

## Component Requirements Summary

### Standard API Pattern

All selection components must follow:

```svelte
<script>
  let {
    items = [],                    // Data array
    value = $bindable(),           // Selected value(s)
    fields = {},                   // Field mapping
    class: className = ''          // User CSS classes
  } = $props()
</script>
```

### Proxy System

Components handling data must use the Proxy system from `@rokkit/states`:

```svelte
import { Proxy } from '@rokkit/states'
let proxyItems = $derived(items.map(item => new Proxy(item, fields)))
```

### Data Attributes

Components must use `data-*` attributes for theming:

```html
<div data-component="list" data-state="active" data-variant="primary">
```

### Snippet Support

Components must support customization via snippets:

```svelte
{#snippet child(node)}
  <CustomRenderer data={node.value} />
{/snippet}
```

## Accessibility Requirements Summary

- WCAG 2.1 AA compliance
- Full keyboard navigation
- Proper ARIA roles and states
- Screen reader compatibility
- Focus management
- Minimum 44x44px touch targets

## Theme Requirements Summary

- Support all three themes: rokkit, minimal, material
- Support dark and light modes
- Use semantic CSS variables
- No hard-coded colors in components

## Related

- [Design Documentation](../design/) - How components are built
- [Component Status](../design/component-status.md) - Implementation tracking
- [.rules/guidelines/](../../.rules/guidelines/) - Coding standards
