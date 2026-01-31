import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit Tree / NestedList

> Composable tree components for hierarchical data display with selection and navigation.

Rokkit provides two tree implementations:
- **bits-ui Tree** - Low-level composable primitives for custom tree UIs
- **ui Tree/NestedList** - Higher-level data-driven tree with built-in features

## Quick Start (Data-Driven)

\`\`\`svelte
<script>
  import { Tree } from '@rokkit/ui'

  let items = $state([
    {
      id: 1,
      label: 'Parent 1',
      expanded: true,
      children: [
        { id: 11, label: 'Child 1.1' },
        { id: 12, label: 'Child 1.2' }
      ]
    },
    {
      id: 2,
      label: 'Parent 2',
      children: [
        { id: 21, label: 'Child 2.1' }
      ]
    }
  ])

  let value = $state(null)
</script>

<Tree.Root bind:items bind:value />
\`\`\`

## Core Concepts

### Data Structure

Tree items follow a nested structure with configurable field mappings:

\`\`\`javascript
const items = [
  {
    id: 'unique-key',        // Unique identifier
    label: 'Display Text',   // Displayed text
    expanded: false,         // Expansion state
    children: []             // Nested items
  }
]
\`\`\`

### Field Mapping

Customize field names to match your data:

\`\`\`svelte
<Tree.Root
  {items}
  fields={{
    value: 'id',
    text: 'name',
    children: 'items',
    expanded: 'isOpen'
  }}
/>
\`\`\`

### Default Fields

| Field | Default | Description |
|-------|---------|-------------|
| \`value\` | \`'id'\` | Unique identifier field |
| \`text\` | \`'label'\` | Display text field |
| \`children\` | \`'children'\` | Nested items field |
| \`expanded\` | \`'expanded'\` | Expansion state field |

## Tree.Root Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`items\` | \`array\` | \`[]\` | Tree data (use \`bind:items\`) |
| \`value\` | \`any\` | \`null\` | Selected value (use \`bind:value\`) |
| \`fields\` | \`object\` | \`defaultFields\` | Field mapping |
| \`icons\` | \`object\` | \`{}\` | Custom state icons |
| \`autoCloseSiblings\` | \`boolean\` | \`false\` | Auto-close other expanded nodes |
| \`multiselect\` | \`boolean\` | \`false\` | Enable multi-selection |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| \`onselect\` | \`{ item, value }\` | Node selected |
| \`ontoggle\` | \`{ item, expanded }\` | Node expanded/collapsed |
| \`onmove\` | \`{ item, direction }\` | Keyboard navigation |

\`\`\`svelte
<Tree.Root
  {items}
  onselect={(e) => console.log('Selected:', e.value)}
  ontoggle={(e) => console.log('Toggled:', e.item, e.expanded)}
/>
\`\`\`

## Snippets (Custom Rendering)

### Header / Footer

\`\`\`svelte
<Tree.Root {items}>
  {#snippet header()}
    <div class="p-2 border-b">Tree Header</div>
  {/snippet}

  {#snippet footer()}
    <div class="p-2 border-t">Tree Footer</div>
  {/snippet}
</Tree.Root>
\`\`\`

### Empty State

\`\`\`svelte
<Tree.Root {items}>
  {#snippet empty()}
    <div class="p-4 text-center text-gray-500">
      No items to display
    </div>
  {/snippet}
</Tree.Root>
\`\`\`

### Custom Node Stub

\`\`\`svelte
<Tree.Root {items}>
  {#snippet stub(node)}
    <div class="flex items-center gap-2">
      <Icon name={node.icon} />
      <span>{node.label}</span>
      <Badge>{node.count}</Badge>
    </div>
  {/snippet}
</Tree.Root>
\`\`\`

## Composable Tree

For maximum customization, use the low-level composable API:

\`\`\`svelte
<script>
  import Tree from '@rokkit/composables/tree'
</script>

<Tree.Root>
  <Tree.Viewport>
    <Tree.NodeList>
      <Tree.Node>
        <Tree.Item>Item 1</Tree.Item>
        <Tree.NodeList>
          <Tree.Node>
            <Tree.Item>Item 1.1</Tree.Item>
          </Tree.Node>
          <Tree.Node>
            <Tree.Item>Item 1.2</Tree.Item>
          </Tree.Node>
        </Tree.NodeList>
      </Tree.Node>
      <Tree.Node>
        <Tree.Item>Item 2</Tree.Item>
      </Tree.Node>
    </Tree.NodeList>
  </Tree.Viewport>
</Tree.Root>
\`\`\`

### Composable Components

| Component | Purpose |
|-----------|---------|
| \`Tree.Root\` | Root container with context |
| \`Tree.Viewport\` | Scrollable viewport |
| \`Tree.NodeList\` | Container for nodes |
| \`Tree.Node\` | Individual tree node |
| \`Tree.Item\` | Node content wrapper |
| \`Tree.Line\` | Connection lines |
| \`Tree.Empty\` | Empty state |
| \`Tree.Loading\` | Loading state |

## NestedList Component

Recursive list for rendering nested data:

\`\`\`svelte
<script>
  import { NestedList } from '@rokkit/ui'

  const items = [
    {
      id: 1,
      hasChildren: true,
      children: [
        { id: 11 },
        { id: 12 }
      ]
    }
  ]
</script>

<NestedList {items}>
  {#snippet child(item)}
    <span>{item.id}</span>
  {/snippet}
</NestedList>
\`\`\`

### NestedList Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`items\` | \`array\` | \`[]\` | Nested data |
| \`nodeIcon\` | \`snippet\` | - | Icon renderer |
| \`depth\` | \`number\` | \`0\` | Current depth |
| \`path\` | \`array\` | \`[]\` | Path to node |

## Node State Icons

Customize icons for different node states:

\`\`\`svelte
<script>
  import ChevronRight from 'lucide-svelte/icons/chevron-right'
  import ChevronDown from 'lucide-svelte/icons/chevron-down'
  import Check from 'lucide-svelte/icons/check'
  import Loader from 'lucide-svelte/icons/loader'

  const icons = {
    expanded: ChevronDown,
    collapsed: ChevronRight,
    selected: Check,
    loading: Loader
  }
</script>

<Tree.Root {items} {icons} />
\`\`\`

## Keyboard Navigation

Built-in keyboard support:
- \`ArrowUp/Down\` - Navigate between visible nodes
- \`ArrowRight\` - Expand node or move to first child
- \`ArrowLeft\` - Collapse node or move to parent
- \`Enter/Space\` - Select focused node
- \`Home/End\` - Jump to first/last node

## Accessibility

- \`role="tree"\` on root container
- \`role="group"\` on node lists
- \`aria-expanded\` state on branch nodes
- Focus management and keyboard navigation
- Screen reader announcements

## Import

\`\`\`javascript
// Data-driven tree
import { Tree } from '@rokkit/ui'

// Or specific components
import Tree from '@rokkit/ui/tree'
import { NestedList } from '@rokkit/ui'

// Low-level composables
import Tree from '@rokkit/composables/tree'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface TreeLineType = 'empty' | 'last' | 'child' | 'sibling'

interface NodeStateIcons {
  expanded?: ComponentType
  collapsed?: ComponentType
  selected?: ComponentType
  loading?: ComponentType
}

interface TreeNodeEvent {
  item: any
  value: any
}

interface TreeToggleEvent {
  item: any
  expanded: boolean
}

interface TreeMoveEvent {
  item: any
  direction: string
}
\`\`\`
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
