import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit List Component

> Data-driven, accessible list component with keyboard navigation and selection support.

The List component renders an array of items as an accessible listbox with single or multi-selection, keyboard navigation, and extensive customization through snippets and field mapping.

## Quick Start

\`\`\`svelte
<script>
  import { List } from '@rokkit/ui'

  let items = [
    { id: 1, text: 'Apple', icon: 'fruit' },
    { id: 2, text: 'Carrot', icon: 'vegetable' },
    { id: 3, text: 'Banana', icon: 'fruit' }
  ]

  let value = $state(null)
</script>

<List {items} bind:value />
\`\`\`

## Core Concepts

### Data-Driven Design

The List component adapts to your data structure through field mapping:

\`\`\`svelte
<script>
  // Your API returns different field names
  const users = [
    { userId: 1, fullName: 'John Doe', avatar: '/john.jpg' },
    { userId: 2, fullName: 'Jane Smith', avatar: '/jane.jpg' }
  ]

  // Map your fields to what List expects
  const fields = {
    value: 'userId',
    text: 'fullName',
    image: 'avatar'
  }
</script>

<List items={users} {fields} bind:value />
\`\`\`

### Proxy System

Each item is wrapped in a Proxy instance for consistent data access:

\`\`\`svelte
<List {items}>
  {#snippet child(node)}
    <div class="custom-item">
      <!-- Use node.get() to access mapped fields -->
      <span>{node.get('text')}</span>

      <!-- Check if field exists -->
      {#if node.has('icon')}
        <Icon name={node.get('icon')} />
      {/if}

      <!-- Access original value -->
      <span class="id">{node.value.id}</span>
    </div>
  {/snippet}
</List>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`items\` | \`array\` | \`[]\` | Data array (use \`bind:items\` for reactivity) |
| \`value\` | \`any\` | \`null\` | Selected item value (use \`bind:value\`) |
| \`fields\` | \`object\` | \`defaultFields\` | Field mapping configuration |
| \`class\` | \`string\` | \`''\` | CSS class names for root container |
| \`name\` | \`string\` | \`'list'\` | Aria-label for accessibility |
| \`tabindex\` | \`number\` | \`0\` | Tab index for keyboard focus |
| \`multiSelect\` | \`boolean\` | \`false\` | Enable multiple item selection |
| \`hierarchy\` | \`array\` | \`[]\` | For nested list support |

## Field Mapping

Map your data fields to component expectations:

| Field | Default | Description |
|-------|---------|-------------|
| \`value\` | \`'value'\` | Unique identifier for selection |
| \`text\` | \`'text'\` | Display text |
| \`icon\` | \`'icon'\` | Icon name or object |
| \`image\` | \`'image'\` | Image URL |
| \`href\` | \`'href'\` | Link URL |
| \`label\` | \`'label'\` | Aria-label |
| \`summary\` | \`'summary'\` | Description text |
| \`children\` | \`'children'\` | Nested items array |
| \`expanded\` | \`'_expanded'\` | Expansion state |
| \`selected\` | \`'_selected'\` | Selection state |
| \`disabled\` | \`'disabled'\` | Disabled state |

### Field Mapping Example

\`\`\`svelte
<script>
  const products = [
    { sku: 'A001', name: 'Widget', thumbnail: '/widget.jpg', price: 9.99 },
    { sku: 'A002', name: 'Gadget', thumbnail: '/gadget.jpg', price: 19.99 }
  ]

  const fields = {
    value: 'sku',
    text: 'name',
    image: 'thumbnail'
  }
</script>

<List items={products} {fields} bind:value />
\`\`\`

## Events

| Handler | Event | Payload | Description |
|---------|-------|---------|-------------|
| \`onchange\` | change | \`{ value, selected }\` | Fired when value changes |
| \`onselect\` | select | \`{ value, selected }\` | Fired when item is selected |
| \`onmove\` | move | \`{ value, selected }\` | Fired when focus moves |

### Event Handling

\`\`\`svelte
<script>
  function handleSelect(event) {
    console.log('Selected:', event.detail.value)
  }

  function handleMove(event) {
    console.log('Focused:', event.detail.value)
  }
</script>

<List {items} onselect={handleSelect} onmove={handleMove} />
\`\`\`

## Snippets

### Header and Footer

\`\`\`svelte
<List {items}>
  {#snippet header()}
    <div class="list-header">
      <h3>Select an Item</h3>
      <span>{items.length} items</span>
    </div>
  {/snippet}

  {#snippet footer()}
    <div class="list-footer">
      <button>Load More</button>
    </div>
  {/snippet}
</List>
\`\`\`

### Empty State

\`\`\`svelte
<List {items}>
  {#snippet empty()}
    <div class="empty-state">
      <Icon name="inbox" size={48} />
      <p>No items found</p>
      <button>Add Item</button>
    </div>
  {/snippet}
</List>
\`\`\`

### Custom Item Rendering

Use the \`child\` snippet to customize item display:

\`\`\`svelte
<List {items}>
  {#snippet child(node)}
    <div class="product-card">
      {#if node.has('image')}
        <img src={node.get('image')} alt="" />
      {/if}
      <div class="details">
        <h4>{node.get('text')}</h4>
        {#if node.has('summary')}
          <p>{node.get('summary')}</p>
        {/if}
        <span class="price">\${node.value.price}</span>
      </div>
    </div>
  {/snippet}
</List>
\`\`\`

## Keyboard Navigation

Built-in keyboard support for accessibility:

| Key | Action |
|-----|--------|
| \`ArrowUp\` | Move focus to previous item |
| \`ArrowDown\` | Move focus to next item |
| \`Home\` | Move focus to first item |
| \`End\` | Move focus to last item |
| \`Enter\` | Select focused item |
| \`Space\` | Select focused item |
| \`Ctrl/Cmd + Space\` | Extend selection (multiSelect mode) |

## Multi-Selection

Enable selecting multiple items:

\`\`\`svelte
<script>
  let items = [
    { id: 1, text: 'Option A' },
    { id: 2, text: 'Option B' },
    { id: 3, text: 'Option C' }
  ]

  // value becomes an array in multiSelect mode
  let value = $state([])
</script>

<List {items} bind:value multiSelect />

<p>Selected: {value.map(v => v.text).join(', ')}</p>
\`\`\`

## Accessibility

The List component includes:

- \`role="listbox"\` on container
- \`role="option"\` on each item
- \`aria-label\` via \`name\` prop
- \`aria-selected\` state on items
- \`aria-current\` on focused item
- Full keyboard navigation
- Focus management with auto-scroll

## Data Attributes for Styling

| Attribute | Element | Purpose |
|-----------|---------|---------|
| \`data-list\` | Root | Main list container |
| \`data-list-header\` | Header | Header section |
| \`data-list-body\` | Body | Items container |
| \`data-list-item\` | Item | Individual list item |
| \`data-list-footer\` | Footer | Footer section |
| \`data-path\` | Item | Unique path for tracking |

### Styling Example

\`\`\`css
/* Theme with data attributes */
[data-list] {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

[data-list-item] {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.15s;
}

[data-list-item]:hover {
  background-color: var(--hover-bg);
}

[data-list-item][aria-selected="true"] {
  background-color: var(--selected-bg);
  color: var(--selected-text);
}

[data-list-item][aria-current="true"] {
  outline: 2px solid var(--focus-ring);
  outline-offset: -2px;
}
\`\`\`

## ListController

The List uses ListController from \`@rokkit/states\` for state management:

\`\`\`javascript
import { ListController } from '@rokkit/states'

// Controller manages:
// - items: reactive items array
// - selectedKeys: SvelteSet of selected keys
// - focusedKey: currently focused item key
// - selected: derived array of selected values
// - focused: derived currently focused value

// Movement methods:
controller.moveFirst()
controller.moveLast()
controller.moveNext()
controller.movePrev()

// Selection methods:
controller.select(key)
controller.extendSelection(key)
controller.toggleSelection(key)
\`\`\`

## Import

\`\`\`javascript
// Named import
import { List } from '@rokkit/ui'

// Default import
import List from '@rokkit/ui/list'

// With related components
import { List, Item, Icon } from '@rokkit/ui'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface ListProps {
  items?: any[]
  value?: any
  fields?: FieldMapping
  class?: string
  name?: string
  tabindex?: number
  multiSelect?: boolean
  hierarchy?: any[]
  header?: Snippet
  footer?: Snippet
  empty?: Snippet
  onchange?: (event: CustomEvent) => void
  onselect?: (event: CustomEvent) => void
  onmove?: (event: CustomEvent) => void
}

interface FieldMapping {
  value?: string
  text?: string
  icon?: string
  image?: string
  href?: string
  label?: string
  summary?: string
  children?: string
  expanded?: string
  selected?: string
  disabled?: string
  [key: string]: string | undefined
}

interface ListEvent {
  value: any
  selected: any[]
}
\`\`\`

## Examples

### Basic Selection

\`\`\`svelte
<script>
  import { List } from '@rokkit/ui'

  let fruits = ['Apple', 'Banana', 'Cherry', 'Date']
  let selected = $state(null)
</script>

<List items={fruits} bind:value={selected} />
<p>Selected: {selected}</p>
\`\`\`

### With Icons

\`\`\`svelte
<script>
  import { List } from '@rokkit/ui'

  let items = [
    { text: 'Home', icon: 'home', href: '/' },
    { text: 'Settings', icon: 'cog', href: '/settings' },
    { text: 'Profile', icon: 'user', href: '/profile' }
  ]
</script>

<List {items} name="Navigation" />
\`\`\`

### Grouped Items with Custom Rendering

\`\`\`svelte
<script>
  import { List, Icon } from '@rokkit/ui'

  let contacts = [
    { name: 'Alice', email: 'alice@example.com', department: 'Engineering' },
    { name: 'Bob', email: 'bob@example.com', department: 'Design' }
  ]

  const fields = { text: 'name', summary: 'email' }
</script>

<List items={contacts} {fields}>
  {#snippet child(node)}
    <div class="contact">
      <Icon name="user" />
      <div>
        <strong>{node.get('text')}</strong>
        <small>{node.get('summary')}</small>
      </div>
    </div>
  {/snippet}
</List>
\`\`\`
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
