import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit Button Component

> Versatile button component with variants, icons, and accessibility support.

The Button component provides a flexible, accessible button with support for multiple variants, left/right icons, and custom content through snippets.

## Quick Start

\`\`\`svelte
<script>
  import { Button } from '@rokkit/ui'
</script>

<Button label="Click Me" onclick={() => console.log('clicked')} />
\`\`\`

## Core Concepts

### Variants

Button supports multiple visual variants:

\`\`\`svelte
<Button variant="default" label="Default" />
<Button variant="primary" label="Primary" />
<Button variant="secondary" label="Secondary" />
<Button variant="tertiary" label="Tertiary" />
\`\`\`

### Icons

Add icons to either side of the button:

\`\`\`svelte
<!-- Icon by name (string) -->
<Button label="Save" leftIcon="save" />
<Button label="Next" rightIcon="arrow-right" />
<Button label="Download" leftIcon="download" rightIcon="chevron-down" />

<!-- Icon as snippet for custom rendering -->
<Button label="Custom">
  {#snippet leftIcon()}
    <MyCustomIcon />
  {/snippet}
</Button>
\`\`\`

### Custom Content

Use children snippet for full control:

\`\`\`svelte
<Button onclick={handleClick}>
  <span class="custom-content">
    <strong>Bold</strong> and <em>italic</em>
  </span>
</Button>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`label\` | \`string\` | \`null\` | Button text |
| \`variant\` | \`string\` | \`'default'\` | Visual variant |
| \`type\` | \`string\` | \`'button'\` | HTML button type |
| \`leftIcon\` | \`string \\| Snippet\` | \`null\` | Icon on left side |
| \`rightIcon\` | \`string \\| Snippet\` | \`null\` | Icon on right side |
| \`disabled\` | \`boolean\` | \`false\` | Disables the button |
| \`description\` | \`string\` | \`null\` | Aria-label override |
| \`class\` | \`string\` | \`''\` | CSS class names |
| \`children\` | \`Snippet\` | \`null\` | Custom button content |
| \`onclick\` | \`function\` | \`undefined\` | Click handler |

### Variant Options

| Variant | Use Case |
|---------|----------|
| \`'default'\` | Standard actions |
| \`'primary'\` | Main call-to-action |
| \`'secondary'\` | Alternative actions |
| \`'tertiary'\` | Low-emphasis actions |

### Type Options

| Type | Use Case |
|------|----------|
| \`'button'\` | Standard button (default) |
| \`'submit'\` | Form submission |
| \`'reset'\` | Form reset |

## Component Structure

\`\`\`
<button data-button-root>
├── <Icon>           // Left icon (if provided)
├── {label}          // Label text or children
└── <Icon>           // Right icon (if provided)
</button>
\`\`\`

## Data Attributes for Styling

| Attribute | Element | Purpose |
|-----------|---------|---------|
| \`data-button-root\` | button | Main button element |
| \`data-variant\` | button | Current variant |
| \`data-disabled\` | button | Disabled state |

### Styling Example

\`\`\`css
[data-button-root] {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

[data-button-root]:active {
  transform: scale(0.98);
}

[data-button-root][data-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Variants */
[data-button-root][data-variant="default"] {
  background: var(--surface-100);
  color: var(--surface-900);
  border: 1px solid var(--border-color);
}

[data-button-root][data-variant="primary"] {
  background: var(--primary-500);
  color: white;
  border: none;
}

[data-button-root][data-variant="secondary"] {
  background: var(--secondary-500);
  color: white;
  border: none;
}

[data-button-root][data-variant="tertiary"] {
  background: transparent;
  color: var(--primary-600);
  border: none;
}

[data-button-root][data-variant="primary"]:hover {
  background: var(--primary-600);
}
\`\`\`

## Accessibility

- Uses native \`<button>\` element
- \`aria-label\` from \`description\` or \`label\` prop
- \`disabled\` attribute properly set
- Keyboard accessible (Enter/Space)

## Import

\`\`\`javascript
// Named import
import { Button } from '@rokkit/ui'

// Default import
import Button from '@rokkit/ui/button'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface ButtonProps {
  label?: string
  variant?: 'default' | 'primary' | 'secondary' | 'tertiary'
  type?: 'button' | 'submit' | 'reset'
  leftIcon?: string | Snippet
  rightIcon?: string | Snippet
  disabled?: boolean
  description?: string
  class?: string
  children?: Snippet
  onclick?: (event: MouseEvent) => void
}
\`\`\`

## Examples

### Basic Buttons

\`\`\`svelte
<script>
  import { Button } from '@rokkit/ui'
</script>

<Button label="Default" />
<Button label="Primary" variant="primary" />
<Button label="Secondary" variant="secondary" />
<Button label="Tertiary" variant="tertiary" />
\`\`\`

### With Icons

\`\`\`svelte
<script>
  import { Button } from '@rokkit/ui'
</script>

<Button label="Add Item" leftIcon="plus" variant="primary" />
<Button label="Continue" rightIcon="arrow-right" />
<Button label="Settings" leftIcon="cog" rightIcon="chevron-down" />
\`\`\`

### Icon-Only Button

\`\`\`svelte
<script>
  import { Button } from '@rokkit/ui'
</script>

<Button leftIcon="menu" description="Open menu" />
<Button leftIcon="close" description="Close" />
\`\`\`

### Form Buttons

\`\`\`svelte
<script>
  import { Button } from '@rokkit/ui'
</script>

<form onsubmit={handleSubmit}>
  <!-- Form fields -->

  <div class="form-actions">
    <Button type="reset" label="Reset" variant="tertiary" />
    <Button type="submit" label="Submit" variant="primary" />
  </div>
</form>
\`\`\`

### Disabled State

\`\`\`svelte
<script>
  import { Button } from '@rokkit/ui'

  let isLoading = $state(false)
</script>

<Button
  label={isLoading ? 'Saving...' : 'Save'}
  disabled={isLoading}
  onclick={handleSave}
/>
\`\`\`

### Custom Content

\`\`\`svelte
<script>
  import { Button } from '@rokkit/ui'
</script>

<Button variant="primary" onclick={handleUpgrade}>
  <span class="upgrade-content">
    <span class="icon">⭐</span>
    <span class="text">
      <strong>Upgrade to Pro</strong>
      <small>Get unlimited access</small>
    </span>
  </span>
</Button>
\`\`\`

### Button Group

\`\`\`svelte
<script>
  import { Button } from '@rokkit/ui'
</script>

<div class="button-group">
  <Button label="Left" />
  <Button label="Center" />
  <Button label="Right" />
</div>

<style>
  .button-group {
    display: flex;
  }
  .button-group :global([data-button-root]) {
    border-radius: 0;
  }
  .button-group :global([data-button-root]:first-child) {
    border-radius: 6px 0 0 6px;
  }
  .button-group :global([data-button-root]:last-child) {
    border-radius: 0 6px 6px 0;
  }
</style>
\`\`\`

## Related Components

- **Icon** - Icon rendering used in buttons
- **Toggle** - For boolean toggle actions
- **FloatingAction** - Floating action buttons
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
