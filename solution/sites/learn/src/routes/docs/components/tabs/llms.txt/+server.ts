import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit Tabs Component

> Data-driven, accessible tabs component with flexible orientation, positioning, and editable tab support.

The Tabs component provides a tabbed interface that adapts to any data structure through field mapping, supports horizontal/vertical layouts, multiple positions, keyboard navigation, and optional add/remove tab functionality.

## Quick Start

\`\`\`svelte
<script>
  import { Tabs } from '@rokkit/ui'

  let options = [
    { text: 'Overview', content: 'Overview content here...' },
    { text: 'Details', content: 'Details content here...' },
    { text: 'Settings', content: 'Settings content here...' }
  ]

  let value = $state(options[0])
</script>

<Tabs {options} bind:value />
\`\`\`

## Core Concepts

### Data-Driven Design

Tabs adapts to your data structure through field mapping:

\`\`\`svelte
<script>
  const sections = [
    { id: 1, title: 'Dashboard', description: 'Analytics overview' },
    { id: 2, title: 'Settings', description: 'Configure application' },
    { id: 3, title: 'Profile', description: 'User profile settings' }
  ]

  const fields = {
    text: 'title',
    content: 'description'
  }

  let selected = $state(sections[0])
</script>

<Tabs options={sections} {fields} bind:value={selected} />
\`\`\`

### Proxy System

Each tab item is wrapped in a Proxy for consistent data access:

\`\`\`svelte
<Tabs {options}>
  {#snippet tabItem(item)}
    <!-- Use item.get() to access mapped fields -->
    <span>{item.get('icon')}</span>
    <span>{item.get('text')}</span>
  {/snippet}

  {#snippet tabPanel(item)}
    <!-- Access original value or mapped fields -->
    <h2>{item.value.title}</h2>
    <p>{item.get('content')}</p>
  {/snippet}
</Tabs>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`options\` | \`array\` | \`[]\` | Array of tab items (use \`bind:options\`) |
| \`value\` | \`any\` | \`null\` | Selected tab (use \`bind:value\`) |
| \`fields\` | \`object\` | \`{}\` | Field mapping configuration |
| \`orientation\` | \`string\` | \`'horizontal'\` | \`'horizontal'\` or \`'vertical'\` |
| \`position\` | \`string\` | \`'before'\` | \`'before'\` or \`'after'\` |
| \`align\` | \`string\` | \`'start'\` | \`'start'\`, \`'center'\`, or \`'end'\` |
| \`placeholder\` | \`string\` | \`'Select a tab...'\` | Text when no tab selected |
| \`editable\` | \`boolean\` | \`false\` | Enable add/remove tabs |
| \`name\` | \`string\` | \`'tabs'\` | Aria-label for accessibility |
| \`tabindex\` | \`number\` | \`0\` | Tab index for keyboard focus |
| \`class\` | \`string\` | \`''\` | CSS class names |
| \`icons\` | \`object\` | \`undefined\` | Custom icons for add/remove |

## Field Mapping

Map your data fields to component expectations:

| Field | Default | Description |
|-------|---------|-------------|
| \`text\` | \`'text'\` | Tab label text |
| \`label\` | \`'label'\` | Alternative to text |
| \`name\` | \`'name'\` | Alternative to text |
| \`content\` | \`'content'\` | Tab panel content |
| \`id\` | \`'id'\` | Unique identifier |
| \`icon\` | \`'icon'\` | Tab icon |
| \`image\` | \`'image'\` | Tab image |

## Events

| Handler | Payload | Description |
|---------|---------|-------------|
| \`onselect\` | \`{ value, selected }\` | Tab selected |
| \`onchange\` | \`{ value, selected }\` | Selection changed |
| \`onmove\` | \`{ value, selected }\` | Focus moved (keyboard) |
| \`onadd\` | none | Add button clicked |
| \`onremove\` | \`item\` | Tab removed |

### Event Handling

\`\`\`svelte
<script>
  function handleSelect(event) {
    console.log('Selected:', event.detail.value)
  }

  function handleAdd() {
    options = [...options, { text: 'New Tab', content: 'New content' }]
  }

  function handleRemove(tab) {
    options = options.filter(t => t !== tab)
    if (value === tab) value = options[0]
  }
</script>

<Tabs
  {options}
  bind:value
  editable
  onselect={handleSelect}
  onadd={handleAdd}
  onremove={handleRemove}
/>
\`\`\`

## Snippets

### Tab Item (Header)

\`\`\`svelte
<Tabs {options}>
  {#snippet tabItem(item)}
    <div class="custom-tab">
      {#if item.has('icon')}
        <Icon name={item.get('icon')} />
      {/if}
      <span>{item.get('text')}</span>
      {#if item.has('badge')}
        <span class="badge">{item.value.badge}</span>
      {/if}
    </div>
  {/snippet}
</Tabs>
\`\`\`

### Tab Panel (Content)

\`\`\`svelte
<Tabs {options}>
  {#snippet tabPanel(item)}
    <article class="tab-content">
      <h2>{item.value.title}</h2>
      <p>{item.get('content')}</p>
      {#if item.value.actions}
        <div class="actions">
          {#each item.value.actions as action}
            <button>{action}</button>
          {/each}
        </div>
      {/if}
    </article>
  {/snippet}
</Tabs>
\`\`\`

### Empty State

\`\`\`svelte
<Tabs {options}>
  {#snippet empty()}
    <div class="empty-tabs">
      <Icon name="folder-open" size={48} />
      <p>No tabs available</p>
      <button onclick={() => options = [{ text: 'First Tab' }]}>
        Add Tab
      </button>
    </div>
  {/snippet}
</Tabs>
\`\`\`

## Orientation and Position

### Horizontal Tabs (Default)

\`\`\`svelte
<!-- Tabs on top (default) -->
<Tabs {options} orientation="horizontal" position="before" />

<!-- Tabs on bottom -->
<Tabs {options} orientation="horizontal" position="after" />
\`\`\`

### Vertical Tabs

\`\`\`svelte
<!-- Tabs on left -->
<Tabs {options} orientation="vertical" position="before" />

<!-- Tabs on right -->
<Tabs {options} orientation="vertical" position="after" />
\`\`\`

### Tab Alignment

\`\`\`svelte
<!-- Aligned to start (default) -->
<Tabs {options} align="start" />

<!-- Centered tabs -->
<Tabs {options} align="center" />

<!-- Aligned to end -->
<Tabs {options} align="end" />
\`\`\`

## Keyboard Navigation

### Horizontal Mode

| Key | Action |
|-----|--------|
| \`ArrowLeft\` | Previous tab |
| \`ArrowRight\` | Next tab |
| \`Home\` | First tab |
| \`End\` | Last tab |
| \`Enter\` / \`Space\` | Select focused tab |

### Vertical Mode

| Key | Action |
|-----|--------|
| \`ArrowUp\` | Previous tab |
| \`ArrowDown\` | Next tab |
| \`Home\` | First tab |
| \`End\` | Last tab |
| \`Enter\` / \`Space\` | Select focused tab |

RTL text direction is automatically detected and arrow key behavior adapts accordingly.

## Editable Tabs

Enable adding and removing tabs dynamically:

\`\`\`svelte
<script>
  import { Tabs } from '@rokkit/ui'

  let options = $state([
    { text: 'Tab 1', content: 'Content 1' },
    { text: 'Tab 2', content: 'Content 2' }
  ])
  let value = $state(options[0])
  let tabCounter = 2

  function handleAdd() {
    tabCounter++
    const newTab = { text: \`Tab \${tabCounter}\`, content: \`Content \${tabCounter}\` }
    options = [...options, newTab]
    value = newTab
  }

  function handleRemove(tab) {
    options = options.filter(t => t !== tab)
    if (value === tab) {
      value = options[0] || null
    }
  }
</script>

<Tabs
  bind:options
  bind:value
  editable
  onadd={handleAdd}
  onremove={handleRemove}
/>
\`\`\`

## Accessibility

The component includes:

- \`role="tablist"\` on tab container
- \`role="tab"\` on each tab trigger
- \`role="tabpanel"\` on content panels
- \`aria-selected\` state on tabs
- \`aria-controls\` linking tabs to panels
- \`aria-labelledby\` on panels
- Full keyboard navigation
- Focus management with auto-scroll

## Data Attributes for Styling

| Attribute | Element | Purpose |
|-----------|---------|---------|
| \`data-tabs-root\` | Root | Main container |
| \`data-orientation\` | Root | \`horizontal\` or \`vertical\` |
| \`data-position\` | Root | \`before\` or \`after\` |
| \`data-align\` | Root | \`start\`, \`center\`, or \`end\` |
| \`data-tabs-list\` | List | Tab bar container |
| \`data-tabs-trigger\` | Tab | Individual tab button |
| \`data-tabs-panel\` | Panel | Content panel |
| \`data-panel-active\` | Panel | \`true\` when visible |
| \`data-tabs-empty\` | Empty | Empty state container |
| \`data-icon-add\` | Button | Add tab button |
| \`data-icon-remove\` | Button | Remove tab button |

### Styling Example

\`\`\`css
[data-tabs-root] {
  display: flex;
  flex-direction: column;
}

[data-tabs-root][data-orientation="vertical"] {
  flex-direction: row;
}

[data-tabs-root][data-position="after"] {
  flex-direction: column-reverse;
}

[data-tabs-list] {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--border-color);
}

[data-tabs-trigger] {
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
}

[data-tabs-trigger][aria-selected="true"] {
  color: var(--primary);
  border-bottom: 2px solid var(--primary);
}

[data-tabs-panel] {
  padding: 16px;
}

[data-tabs-panel][data-panel-active="false"] {
  display: none;
}
\`\`\`

## Import

\`\`\`javascript
// Named import
import { Tabs } from '@rokkit/ui'

// Default import
import Tabs from '@rokkit/ui/tabs'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface TabsProps {
  options?: any[]
  value?: any
  fields?: FieldMapping
  orientation?: 'horizontal' | 'vertical'
  position?: 'before' | 'after'
  align?: 'start' | 'center' | 'end'
  placeholder?: string
  editable?: boolean
  name?: string
  tabindex?: number
  class?: string
  icons?: TabIcons
  tabItem?: Snippet<[Proxy]>
  tabPanel?: Snippet<[Proxy]>
  empty?: Snippet
  onselect?: (event: TabEvent) => void
  onchange?: (event: TabEvent) => void
  onmove?: (event: TabEvent) => void
  onadd?: () => void
  onremove?: (item: any) => void
}

interface TabEvent {
  value: any
  selected: any[]
}

interface TabIcons {
  add?: string
  remove?: string
}
\`\`\`

## Examples

### Simple String Tabs

\`\`\`svelte
<script>
  import { Tabs } from '@rokkit/ui'

  let tabs = ['Home', 'Products', 'About', 'Contact']
  let value = $state('Home')
</script>

<Tabs options={tabs} bind:value>
  {#snippet tabPanel(item)}
    <p>Content for {item.value}</p>
  {/snippet}
</Tabs>
\`\`\`

### Vertical Navigation Tabs

\`\`\`svelte
<script>
  let sections = [
    { id: 'general', text: 'General', icon: 'settings' },
    { id: 'security', text: 'Security', icon: 'lock' },
    { id: 'billing', text: 'Billing', icon: 'credit-card' }
  ]
</script>

<Tabs options={sections} orientation="vertical" position="before">
  {#snippet tabItem(item)}
    <Icon name={item.get('icon')} />
    <span>{item.get('text')}</span>
  {/snippet}
</Tabs>
\`\`\`

### Bottom-Aligned Tabs

\`\`\`svelte
<Tabs
  options={tabs}
  orientation="horizontal"
  position="after"
  align="center"
/>
\`\`\`

### Full Configuration

\`\`\`svelte
<Tabs
  options={items}
  bind:value={selectedTab}
  fields={{ text: 'label', content: 'body' }}
  orientation="horizontal"
  position="before"
  align="start"
  editable
  placeholder="Select a tab to view content"
  onadd={handleAdd}
  onremove={handleRemove}
  onchange={handleChange}
>
  {#snippet tabItem(item)}
    <span class="tab-label">{item.get('text')}</span>
  {/snippet}

  {#snippet tabPanel(item)}
    <div class="panel-content">
      {@html item.get('content')}
    </div>
  {/snippet}

  {#snippet empty()}
    <p>No tabs. Click + to add one.</p>
  {/snippet}
</Tabs>
\`\`\`

## Related Components

- **List** - Used internally for tab selection
- **ListController** - State management for tabs
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
