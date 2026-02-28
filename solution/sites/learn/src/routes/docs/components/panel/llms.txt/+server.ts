import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit Panel Component

> Flexible container component with header, body, and footer sections.

The Panel component provides a structured container with optional header, body, and footer sections. It's useful for cards, dialogs, sidebars, and any UI that needs consistent sectioning.

## Quick Start

\`\`\`svelte
<script>
  import { Panel } from '@rokkit/ui'
</script>

<Panel>
  {#snippet header()}
    <h2>Panel Title</h2>
  {/snippet}

  {#snippet body()}
    <p>Panel content goes here.</p>
  {/snippet}

  {#snippet footer()}
    <button>Action</button>
  {/snippet}
</Panel>
\`\`\`

## Core Concepts

### Snippet-Based Sections

Panel uses Svelte 5 snippets for each section, allowing full customization:

\`\`\`svelte
<Panel>
  {#snippet header()}
    <!-- Header content -->
  {/snippet}

  {#snippet body()}
    <!-- Main content -->
  {/snippet}

  {#snippet footer()}
    <!-- Footer content -->
  {/snippet}
</Panel>
\`\`\`

### Flexible Usage

All sections are optional. Use only what you need:

\`\`\`svelte
<!-- Header and body only -->
<Panel>
  {#snippet header()}
    <h3>Settings</h3>
  {/snippet}

  {#snippet body()}
    <SettingsForm />
  {/snippet}
</Panel>

<!-- Body only (simple container) -->
<Panel>
  {#snippet body()}
    <p>Just content, no chrome.</p>
  {/snippet}
</Panel>
\`\`\`

### Children as Body

For simpler cases, use children as the body content:

\`\`\`svelte
<Panel>
  {#snippet header()}
    <h3>Title</h3>
  {/snippet}

  <!-- Children become body content -->
  <p>This content appears in the body.</p>
  <p>Multiple elements work too.</p>
</Panel>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`class\` | \`string\` | \`''\` | CSS class names for the container |
| \`header\` | \`Snippet\` | \`undefined\` | Header section content |
| \`body\` | \`Snippet\` | \`undefined\` | Body section content |
| \`footer\` | \`Snippet\` | \`undefined\` | Footer section content |
| \`children\` | \`Snippet\` | \`undefined\` | Default content (used as body if body snippet not provided) |

## Component Structure

\`\`\`
<panel>
├── <panel-header>    // When header snippet provided
│   └── {header}
├── <panel-body>      // When body snippet or children provided
│   └── {body} or {children}
└── <panel-footer>    // When footer snippet provided
    └── {footer}
</panel>
\`\`\`

## Data Attributes for Styling

| Element | Selector | Purpose |
|---------|----------|---------|
| Root | \`panel\` | Main container |
| Header | \`panel-header\` | Header section |
| Body | \`panel-body\` | Body section |
| Footer | \`panel-footer\` | Footer section |

### Styling Example

\`\`\`css
panel {
  display: flex;
  flex-direction: column;
  background: var(--surface-100);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

panel-header {
  padding: 16px;
  background: var(--surface-50);
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
}

panel-body {
  padding: 16px;
  flex: 1;
}

panel-footer {
  padding: 16px;
  background: var(--surface-50);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
\`\`\`

## Import

\`\`\`javascript
// Named import
import { Panel } from '@rokkit/ui'

// Default import
import Panel from '@rokkit/ui/panel'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface PanelProps {
  class?: string
  header?: Snippet
  body?: Snippet
  footer?: Snippet
  children?: Snippet
}
\`\`\`

## Examples

### Card Layout

\`\`\`svelte
<script>
  import { Panel } from '@rokkit/ui'
</script>

<Panel class="card">
  {#snippet header()}
    <div class="card-header">
      <h3>Product Name</h3>
      <span class="price">$29.99</span>
    </div>
  {/snippet}

  {#snippet body()}
    <img src="/product.jpg" alt="Product" />
    <p>Product description goes here.</p>
  {/snippet}

  {#snippet footer()}
    <button class="secondary">Details</button>
    <button class="primary">Add to Cart</button>
  {/snippet}
</Panel>
\`\`\`

### Dialog/Modal Content

\`\`\`svelte
<script>
  import { Panel } from '@rokkit/ui'

  let { onclose, onconfirm } = $props()
</script>

<Panel class="dialog">
  {#snippet header()}
    <h2>Confirm Action</h2>
  {/snippet}

  {#snippet body()}
    <p>Are you sure you want to delete this item?</p>
    <p class="warning">This action cannot be undone.</p>
  {/snippet}

  {#snippet footer()}
    <button onclick={onclose}>Cancel</button>
    <button class="danger" onclick={onconfirm}>Delete</button>
  {/snippet}
</Panel>
\`\`\`

### Sidebar Section

\`\`\`svelte
<script>
  import { Panel, List } from '@rokkit/ui'

  let menuItems = [
    { text: 'Dashboard', icon: 'home' },
    { text: 'Settings', icon: 'cog' },
    { text: 'Profile', icon: 'user' }
  ]
</script>

<Panel class="sidebar-section">
  {#snippet header()}
    <span class="section-title">Navigation</span>
  {/snippet}

  {#snippet body()}
    <List items={menuItems} />
  {/snippet}
</Panel>
\`\`\`

### Settings Panel

\`\`\`svelte
<script>
  import { Panel, Switch } from '@rokkit/ui'

  let notifications = $state(true)
  let darkMode = $state(false)
</script>

<Panel>
  {#snippet header()}
    <h3>Preferences</h3>
  {/snippet}

  {#snippet body()}
    <div class="setting">
      <label>Enable Notifications</label>
      <Switch bind:value={notifications} />
    </div>
    <div class="setting">
      <label>Dark Mode</label>
      <Switch bind:value={darkMode} />
    </div>
  {/snippet}

  {#snippet footer()}
    <button>Save Changes</button>
  {/snippet}
</Panel>
\`\`\`

### Collapsible Panel

\`\`\`svelte
<script>
  import { Panel, Icon } from '@rokkit/ui'

  let expanded = $state(true)
</script>

<Panel class="collapsible">
  {#snippet header()}
    <button class="toggle" onclick={() => expanded = !expanded}>
      <span>Advanced Options</span>
      <Icon name={expanded ? 'chevron-up' : 'chevron-down'} />
    </button>
  {/snippet}

  {#if expanded}
    {#snippet body()}
      <div class="options">
        <!-- Advanced options here -->
      </div>
    {/snippet}
  {/if}
</Panel>
\`\`\`

### Nested Panels

\`\`\`svelte
<script>
  import { Panel } from '@rokkit/ui'
</script>

<Panel class="outer">
  {#snippet header()}
    <h2>Dashboard</h2>
  {/snippet}

  {#snippet body()}
    <div class="grid">
      <Panel class="inner">
        {#snippet header()}Stats{/snippet}
        {#snippet body()}
          <div class="stat">42</div>
        {/snippet}
      </Panel>

      <Panel class="inner">
        {#snippet header()}Activity{/snippet}
        {#snippet body()}
          <ActivityChart />
        {/snippet}
      </Panel>
    </div>
  {/snippet}
</Panel>
\`\`\`

### Form Panel

\`\`\`svelte
<script>
  import { Panel } from '@rokkit/ui'

  let formData = $state({ name: '', email: '' })

  function handleSubmit() {
    console.log('Submitting:', formData)
  }
</script>

<Panel>
  {#snippet header()}
    <h3>Contact Us</h3>
  {/snippet}

  {#snippet body()}
    <form onsubmit|preventDefault={handleSubmit}>
      <label>
        Name
        <input bind:value={formData.name} />
      </label>
      <label>
        Email
        <input type="email" bind:value={formData.email} />
      </label>
    </form>
  {/snippet}

  {#snippet footer()}
    <button type="submit" onclick={handleSubmit}>Send Message</button>
  {/snippet}
</Panel>
\`\`\`

## Use Cases

| Use Case | Header | Body | Footer |
|----------|--------|------|--------|
| Card | Title | Content | Actions |
| Dialog | Title | Message | Buttons |
| Sidebar | Section name | Menu items | - |
| Settings | Category | Options | Save button |
| Form | Form title | Fields | Submit |

## Related Components

- **Card** - Specialized card component (if available)
- **Accordion** - Collapsible panels
- **Tabs** - Multiple panel sections with tab navigation
- **FloatingActions** - Floating action buttons overlay
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
