import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit Accordion Component

> Collapsible content panels with nested item support.

The Accordion component displays expandable/collapsible sections, each containing a list of items. It supports field mapping, keyboard navigation, and auto-close behavior.

## Quick Start

\`\`\`svelte
<script>
  import { Accordion } from '@rokkit/ui'

  let sections = [
    {
      text: 'Getting Started',
      expanded: true,
      children: [
        { text: 'Installation' },
        { text: 'Quick Start' },
        { text: 'Configuration' }
      ]
    },
    {
      text: 'Components',
      expanded: false,
      children: [
        { text: 'Button' },
        { text: 'Input' },
        { text: 'Select' }
      ]
    }
  ]

  let selected = $state(null)
</script>

<Accordion items={sections} bind:value={selected} />
\`\`\`

## Core Concepts

### Section Structure

Each item in the accordion represents a section with children:

\`\`\`javascript
const sections = [
  {
    text: 'Section Title',      // Display text
    expanded: false,            // Initial state
    children: [                 // Nested items
      { text: 'Item 1' },
      { text: 'Item 2' }
    ]
  }
]
\`\`\`

### Auto-Close Siblings

Automatically close other sections when one opens:

\`\`\`svelte
<Accordion items={sections} autoCloseSiblings />
\`\`\`

### Multi-Select

Allow selecting multiple items:

\`\`\`svelte
<Accordion items={sections} multiselect bind:value={selected} />
\`\`\`

### Field Mapping

Map your data structure to accordion expectations:

\`\`\`svelte
<script>
  const docs = [
    {
      title: 'Introduction',
      isOpen: true,
      pages: [
        { name: 'Overview', url: '/overview' },
        { name: 'Getting Started', url: '/start' }
      ]
    }
  ]

  const fields = {
    text: 'title',
    expanded: 'isOpen',
    children: 'pages'
  }
</script>

<Accordion items={docs} {fields} />
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`items\` | \`array\` | \`[]\` | Accordion sections (use \`bind:items\`) |
| \`value\` | \`any\` | \`null\` | Selected item (use \`bind:value\`) |
| \`fields\` | \`object\` | \`{}\` | Field mapping configuration |
| \`autoCloseSiblings\` | \`boolean\` | \`false\` | Close others on expand |
| \`multiselect\` | \`boolean\` | \`false\` | Allow multiple selections |
| \`class\` | \`string\` | \`''\` | CSS class names |
| \`header\` | \`Snippet\` | \`undefined\` | Custom header content |
| \`footer\` | \`Snippet\` | \`undefined\` | Custom footer content |
| \`empty\` | \`Snippet\` | \`undefined\` | Empty state content |

## Events

| Handler | Payload | Description |
|---------|---------|-------------|
| \`onexpand\` | \`item\` | Section expanded |
| \`oncollapse\` | \`item\` | Section collapsed |
| \`onselect\` | \`item\` | Item selected |
| \`onchange\` | \`item\` | Selection changed |
| \`onmove\` | \`{ from, to }\` | Item moved |

## Field Mapping

| Field | Default | Description |
|-------|---------|-------------|
| \`text\` | \`'text'\` | Section/item label |
| \`expanded\` | \`'expanded'\` | Expansion state |
| \`children\` | \`'children'\` | Nested items array |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| \`ArrowDown\` | Move to next item |
| \`ArrowUp\` | Move to previous item |
| \`ArrowRight\` | Expand section |
| \`ArrowLeft\` | Collapse section |
| \`Enter\` / \`Space\` | Toggle section / Select item |
| \`Home\` | First item |
| \`End\` | Last item |

## Component Structure

\`\`\`
<rk-accordion>
├── <rk-header>                    // Optional header
├── <div>                          // Section container
│   ├── <Summary>                  // Section header
│   └── <rk-list>                  // Items (when expanded)
│       └── <ListBody>
│           └── <Item>             // Each child item
├── ...                            // More sections
└── <rk-footer>                    // Optional footer
</rk-accordion>
\`\`\`

## Data Attributes for Styling

| Attribute | Element | Purpose |
|-----------|---------|---------|
| \`rk-accordion\` | Root | Main container |
| \`.is-expanded\` | Section | Expanded state class |
| \`.is-selected\` | Section/Item | Selected state class |
| \`data-path\` | Section | Section index |

### Styling Example

\`\`\`css
rk-accordion {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

rk-accordion > div {
  border-bottom: 1px solid var(--border-color);
}

rk-accordion > div:last-child {
  border-bottom: none;
}

/* Section header */
rk-accordion :global([data-summary]) {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--surface-100);
  cursor: pointer;
  user-select: none;
}

rk-accordion :global([data-summary]:hover) {
  background: var(--surface-200);
}

/* Expanded section */
rk-accordion > div.is-expanded :global([data-summary]) {
  background: var(--primary-100);
  font-weight: 600;
}

/* Section content */
rk-accordion rk-list {
  padding: 8px 0;
  background: var(--surface-50);
}

/* Items */
rk-accordion :global([data-item]) {
  padding: 8px 16px 8px 32px;
}

rk-accordion :global([data-item]:hover) {
  background: var(--surface-100);
}

rk-accordion :global([data-item].is-selected) {
  background: var(--primary-100);
  color: var(--primary-700);
}
\`\`\`

## Import

\`\`\`javascript
// Named import
import { Accordion } from '@rokkit/ui'

// Default import
import Accordion from '@rokkit/ui/accordion'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface AccordionProps {
  items?: AccordionItem[]
  value?: any
  fields?: FieldMapping
  autoCloseSiblings?: boolean
  multiselect?: boolean
  class?: string
  header?: Snippet
  footer?: Snippet
  empty?: Snippet
  onexpand?: (item: any) => void
  oncollapse?: (item: any) => void
  onselect?: (item: any) => void
  onchange?: (item: any) => void
  onmove?: (event: { from: number, to: number }) => void
}

interface AccordionItem {
  text?: string
  expanded?: boolean
  children?: any[]
  [key: string]: any
}
\`\`\`

## Examples

### Documentation Navigation

\`\`\`svelte
<script>
  import { Accordion } from '@rokkit/ui'

  let docs = [
    {
      text: 'Getting Started',
      expanded: true,
      children: [
        { text: 'Installation', href: '/docs/install' },
        { text: 'Quick Start', href: '/docs/quick-start' }
      ]
    },
    {
      text: 'Components',
      children: [
        { text: 'Button', href: '/docs/button' },
        { text: 'Input', href: '/docs/input' }
      ]
    },
    {
      text: 'API Reference',
      children: [
        { text: 'Props', href: '/docs/props' },
        { text: 'Events', href: '/docs/events' }
      ]
    }
  ]

  let selected = $state(null)
</script>

<Accordion items={docs} bind:value={selected} autoCloseSiblings />
\`\`\`

### FAQ Section

\`\`\`svelte
<script>
  import { Accordion } from '@rokkit/ui'

  let faqs = [
    {
      text: 'How do I install?',
      expanded: false,
      children: [
        { text: 'Run npm install @rokkit/ui in your project.' }
      ]
    },
    {
      text: 'Is it free to use?',
      children: [
        { text: 'Yes, Rokkit is open source and free for all uses.' }
      ]
    },
    {
      text: 'Does it support TypeScript?',
      children: [
        { text: 'Yes, full TypeScript support is included.' }
      ]
    }
  ]
</script>

<Accordion items={faqs} autoCloseSiblings />
\`\`\`

### Settings Panel

\`\`\`svelte
<script>
  import { Accordion } from '@rokkit/ui'

  let settings = [
    {
      text: 'General',
      expanded: true,
      children: [
        { text: 'Language' },
        { text: 'Timezone' },
        { text: 'Date Format' }
      ]
    },
    {
      text: 'Notifications',
      children: [
        { text: 'Email' },
        { text: 'Push' },
        { text: 'SMS' }
      ]
    },
    {
      text: 'Privacy',
      children: [
        { text: 'Data Sharing' },
        { text: 'Analytics' }
      ]
    }
  ]

  let activeSetting = $state(null)

  function handleSelect(item) {
    console.log('Opening setting:', item.text)
  }
</script>

<Accordion
  items={settings}
  bind:value={activeSetting}
  onselect={handleSelect}
/>
\`\`\`

### With Custom Field Mapping

\`\`\`svelte
<script>
  import { Accordion } from '@rokkit/ui'

  let categories = [
    {
      name: 'Electronics',
      open: true,
      products: [
        { title: 'Laptop' },
        { title: 'Phone' },
        { title: 'Tablet' }
      ]
    },
    {
      name: 'Clothing',
      products: [
        { title: 'Shirts' },
        { title: 'Pants' }
      ]
    }
  ]

  const fields = {
    text: 'name',
    expanded: 'open',
    children: 'products',
    fields: { text: 'title' }
  }
</script>

<Accordion items={categories} {fields} />
\`\`\`

### Empty State

\`\`\`svelte
<script>
  import { Accordion } from '@rokkit/ui'

  let items = $state([])
</script>

<Accordion {items}>
  {#snippet empty()}
    <div class="empty-state">
      <p>No sections available</p>
      <button onclick={addSection}>Add Section</button>
    </div>
  {/snippet}
</Accordion>
\`\`\`

### With Header and Footer

\`\`\`svelte
<script>
  import { Accordion } from '@rokkit/ui'
</script>

<Accordion {items}>
  {#snippet header()}
    <div class="accordion-header">
      <h3>Documentation</h3>
      <button>Expand All</button>
    </div>
  {/snippet}

  {#snippet footer()}
    <div class="accordion-footer">
      <a href="/docs">View All Docs</a>
    </div>
  {/snippet}
</Accordion>
\`\`\`

## Related Components

- **Tree** - Hierarchical tree with deeper nesting
- **NestedList** - Nested list without collapse behavior
- **List** - Simple flat list
- **Panel** - Collapsible panel container
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
