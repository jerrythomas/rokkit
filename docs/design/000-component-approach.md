# Component Development Approach Pattern

> A condensed, reusable pattern for developing UI components. This can be adapted for any component library.

## Component Development Checklist

### Phase 1: Classification & Requirements

- [ ] **Categorize the component**
  - Data-driven: Accepts data array, handles rendering internally
  - Composable: Compound components, user controls structure
  
- [ ] **Clarify requirements**
  - What problem does it solve?
  - What data structures will it accept?
  - What interactions are needed?
  - What accessibility requirements apply?

### Phase 2: Design

- [ ] **Define the component interface**
  - Props with types and defaults
  - Events/callbacks
  - Slots/snippets for customization
  
- [ ] **Design data flow**
  - Input data format
  - Internal state management
  - Output events/callbacks

- [ ] **Design interaction patterns**
  - Mouse interactions
  - Keyboard navigation
  - Touch/mobile support

- [ ] **Design accessibility**
  - ARIA roles and attributes
  - Focus management
  - Screen reader announcements

### Phase 3: Implementation

- [ ] **Create types file** (`types.js`)
  - Base/shared types
  - Component-specific types
  - Export from package index

- [ ] **Implement component**
  - Use data attributes for styling hooks
  - Use ARIA attributes for accessibility
  - No internal styling (unstyled by default)
  - Snippet support for customization

- [ ] **Implement keyboard navigation**
  - Arrow keys for navigation
  - Enter/Space for selection
  - Escape for dismissal
  - Home/End for boundaries

### Phase 4: Styling

- [ ] **Define data attributes**
  - `data-component-root`
  - `data-component-item`
  - `data-selected`, `data-focused`, `data-disabled`

- [ ] **Create theme styles**
  - Default/neutral state
  - Hover state
  - Focus state (visible focus ring)
  - Active/pressed state
  - Selected state
  - Disabled state
  - Error state

### Phase 5: Testing

- [ ] **Unit tests**
  - Rendering with various props
  - Event firing
  - Keyboard navigation
  - Edge cases

- [ ] **Component tests** (if applicable)
  - Visual regression
  - Interaction flows
  - Accessibility audit

### Phase 6: Documentation

- [ ] **Create llms.txt**
  - Quick start example
  - All props documented
  - Events documented
  - Keyboard shortcuts
  - Accessibility notes
  - Styling guide

- [ ] **Create visual examples**
  - Basic usage
  - With field mapping (if applicable)
  - With custom rendering
  - Various states
  - Edge cases

- [ ] **E2E tests for examples**
  - Verify examples render correctly
  - Test documented interactions

---

## Type System Pattern

### Base Types (shared)

```javascript
// types.js
/**
 * Base props for data-driven components
 * @typedef {Object} BaseDataProps
 * @property {any[]} [options=[]] - Data array
 * @property {Object} [fields={}] - Field mapping configuration
 * @property {string} [class=''] - CSS class names
 */

/**
 * Base props for interactive components
 * @typedef {Object} BaseInteractiveProps
 * @property {boolean} [disabled=false] - Disable interaction
 * @property {number} [tabindex=0] - Tab index
 */

/**
 * Base props for selection components
 * @typedef {Object} BaseSelectionProps
 * @property {any} [value] - Selected value
 * @property {string} [name] - Accessibility name
 */
```

### Component Types (extend base)

```javascript
// list/types.js
/**
 * @typedef {import('../types.js').BaseDataProps & 
 *           import('../types.js').BaseSelectionProps & 
 *           ListSpecificProps} ListProps
 */

/**
 * @typedef {Object} ListSpecificProps
 * @property {boolean} [multiSelect=false] - Multiple selection
 * @property {Function} [onselect] - Selection callback
 * @property {import('svelte').Snippet} [child] - Custom item renderer
 */
```

---

## Component Structure Pattern

```svelte
<script>
  /** @type {import('./types.js').ComponentProps} */
  let {
    // Data props
    options = [],
    fields = {},
    
    // Selection props
    value = $bindable(),
    
    // Interaction props
    disabled = false,
    tabindex = 0,
    
    // Styling props
    class: className = '',
    
    // Snippets
    child,
    
    // Callbacks
    onselect,
    onchange
  } = $props()

  // Internal state
  let focused = $state(null)

  // Derived state
  let processedItems = $derived(
    options.map(item => new Proxy(item, fields))
  )

  // Event handlers
  function handleSelect(item) {
    value = item
    onselect?.(item)
    onchange?.(item)
  }
</script>

<div
  data-component-root
  class={className}
  class:disabled
  role="listbox"
  aria-label={name}
  {tabindex}
  use:keyboard={keyMapping}
>
  {#each processedItems as item (item.id)}
    <div
      data-component-item
      data-selected={item === value}
      data-focused={item === focused}
      role="option"
      aria-selected={item === value}
      onclick={() => handleSelect(item)}
    >
      {#if child}
        {@render child(item)}
      {:else}
        <span>{item.get('text')}</span>
      {/if}
    </div>
  {/each}
</div>
```

---

## Data Attribute Pattern

### Naming Convention

```
data-{component}-{element}
data-{state}
```

### Standard Attributes

| Attribute | Purpose |
|-----------|---------|
| `data-{component}-root` | Main container |
| `data-{component}-item` | Repeated item |
| `data-{component}-header` | Header section |
| `data-{component}-body` | Body section |
| `data-{component}-footer` | Footer section |
| `data-selected` | Selected state |
| `data-focused` | Focused state |
| `data-disabled` | Disabled state |
| `data-expanded` | Expanded state |

---

## Accessibility Pattern

### ARIA Roles by Component Type

| Type | Container Role | Item Role |
|------|---------------|-----------|
| List | listbox | option |
| Tree | tree | treeitem |
| Menu | menu | menuitem |
| Tabs | tablist | tab |
| Grid | grid | gridcell |

### Keyboard Patterns

| Component | Navigation | Selection |
|-----------|------------|-----------|
| List | Up/Down | Enter/Space |
| Tree | Up/Down + Left/Right | Enter/Space |
| Tabs | Left/Right or Up/Down | Auto on focus |
| Menu | Up/Down | Enter |
| Grid | All arrows | Enter/Space |

### Required ARIA Attributes

```html
<!-- Container -->
<div role="listbox" aria-label="Name" aria-orientation="vertical">
  
  <!-- Items -->
  <div role="option" 
       aria-selected="true|false"
       aria-disabled="true|false">
    Content
  </div>
</div>
```

---

## Styling Pattern

### Theme Variables

```css
/* Component uses CSS custom properties */
[data-component-root] {
  --component-bg: var(--surface-100);
  --component-border: var(--border-color);
  --component-text: var(--text-primary);
  --component-focus-ring: var(--focus-ring);
}
```

### State Styles

```css
/* Default state */
[data-component-item] {
  background: var(--component-bg);
  color: var(--component-text);
}

/* Hover */
[data-component-item]:hover {
  background: var(--surface-200);
}

/* Focus */
[data-component-item]:focus-visible,
[data-component-item][data-focused] {
  outline: 2px solid var(--component-focus-ring);
  outline-offset: -2px;
}

/* Selected */
[data-component-item][data-selected] {
  background: var(--primary-100);
  color: var(--primary-700);
}

/* Disabled */
[data-component-item][data-disabled] {
  opacity: 0.5;
  pointer-events: none;
}
```

---

## Testing Pattern

### Unit Test Structure

```javascript
import { render, fireEvent } from '@testing-library/svelte'
import { describe, it, expect } from 'vitest'
import Component from './Component.svelte'

describe('Component', () => {
  describe('rendering', () => {
    it('renders with default props', () => {})
    it('renders with options', () => {})
    it('renders with custom fields', () => {})
  })

  describe('selection', () => {
    it('selects item on click', () => {})
    it('fires onselect callback', () => {})
    it('updates value binding', () => {})
  })

  describe('keyboard navigation', () => {
    it('moves focus with arrow keys', () => {})
    it('selects with Enter', () => {})
    it('selects with Space', () => {})
  })

  describe('accessibility', () => {
    it('has correct ARIA attributes', () => {})
    it('manages focus correctly', () => {})
  })
})
```

---

## Documentation Pattern (llms.txt)

```markdown
# Component Name

> One-line description

## Quick Start
[Minimal working example]

## Props
[Table of all props with types and defaults]

## Events
[Table of events with payloads]

## Snippets
[Available customization slots]

## Keyboard Navigation
[Key mappings]

## Accessibility
[ARIA attributes, roles]

## Data Attributes
[Styling hooks]

## Examples
[Progressive examples from simple to complex]

## TypeScript
[Type definitions]
```

---

## CLI Integration Pattern

### svelte-add preset

```javascript
// preset.js
export default {
  name: 'rokkit',
  packages: ['@rokkit/ui', '@rokkit/themes'],
  files: [
    {
      name: 'src/app.css',
      content: '@import "@rokkit/themes/rokkit.css";'
    }
  ],
  scripts: {
    postinstall: 'rokkit setup'
  }
}
```

### CLI commands

```bash
npx @rokkit/cli init           # Initialize project
npx @rokkit/cli add ui forms   # Add packages
npx @rokkit/cli theme rokkit   # Set theme
```
