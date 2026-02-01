import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit UI Component Library

> Data-driven, accessible UI components for Svelte 5

Rokkit is a cutting-edge UI library that empowers developers to build stunning, flexible user interfaces with minimal effort while maintaining full control over styling and behavior. The library is designed around the principle that data should drive the interface, not the other way around.

## Core Principles

- **Data-First Design**: Components automatically adapt to data structures without requiring transformation
- **Composable Flexibility**: Every component is extensible via snippets and component overrides
- **Consistent API**: All selection components follow the same pattern (items, value, fields)
- **Accessible by Default**: WCAG 2.1 AA compliance with full keyboard navigation

## Quick Start

\`\`\`svelte
<script>
  import { List } from '@rokkit/ui'

  let items = [
    { id: 1, name: 'Apple', category: 'Fruit' },
    { id: 2, name: 'Carrot', category: 'Vegetable' },
    { id: 3, name: 'Banana', category: 'Fruit' }
  ]

  let value = $state(null)
</script>

<List {items} bind:value fields={{ text: 'name' }} />
\`\`\`

## Standard API Pattern

All selection components follow this consistent pattern:

\`\`\`svelte
<script>
  let {
    items = [],                    // Data array
    value = $bindable(),           // Selected value(s)
    fields = {},                   // Field mapping configuration
    class: className = ''          // User CSS classes
  } = $props()
</script>
\`\`\`

### Props

| Prop | Type | Description |
|------|------|-------------|
| \`items\` | \`array\` | Data array to render |
| \`value\` | \`any\` | Selected item(s), use \`bind:value\` |
| \`fields\` | \`object\` | Maps your data fields to component expectations |
| \`child\` | \`snippet\` | Custom item renderer |
| \`class\` | \`string\` | Additional CSS classes |

## Field Mapping System

Map any data structure to component expectations without transforming data:

\`\`\`svelte
<script>
  // Your data uses different field names
  const users = [
    { id: 1, fullName: 'John Doe', avatar: '/john.jpg' },
    { id: 2, fullName: 'Jane Smith', avatar: '/jane.jpg' }
  ]

  // Map your fields to what the component expects
  const fields = {
    value: 'id',        // Unique identifier
    text: 'fullName',   // Display text
    image: 'avatar'     // Image source
  }
</script>

<List items={users} {fields} />
\`\`\`

### Default Fields

| Field | Default | Description |
|-------|---------|-------------|
| \`value\` | \`'id'\` | Unique identifier |
| \`text\` | \`'label'\` | Display text |
| \`children\` | \`'children'\` | Nested items |
| \`image\` | \`'image'\` | Image source |
| \`icon\` | \`'icon'\` | Icon name |
| \`href\` | \`'href'\` | Link URL |
| \`disabled\` | \`'disabled'\` | Disabled state |

## Packages

| Package | Description |
|---------|-------------|
| \`@rokkit/core\` | Core utilities and field mapping system |
| \`@rokkit/ui\` | Main UI components (57+ components) |
| \`@rokkit/composables\` | Composable primitives built on bits-ui |
| \`@rokkit/forms\` | Dynamic form generation with schema support |
| \`@rokkit/states\` | State management and Proxy system |
| \`@rokkit/actions\` | Svelte actions for behaviors (keyboard, swipe, etc.) |
| \`@rokkit/data\` | Data manipulation utilities |
| \`@rokkit/themes\` | CSS themes (rokkit, minimal, material) |
| \`@rokkit/icons\` | Icon system with Iconify integration |

## Component Index

### Selection Components
- [List](/docs/components/list/llms.txt) - Vertical list with selection
- [Select](/docs/components/select/llms.txt) - Dropdown selection
- [MultiSelect](/docs/components/multiselect/llms.txt) - Multiple item selection
- [Switch](/docs/components/switch/llms.txt) - Toggle between options
- [Tabs](/docs/components/tabs/llms.txt) - Tabbed interface
- [RadioGroup](/docs/components/radiogroup/llms.txt) - Radio button group

### Hierarchical Components
- [Tree](/docs/components/tree/llms.txt) - Tree view with expand/collapse
- [NestedList](/docs/components/nestedlist/llms.txt) - Recursive nested list
- [Accordion](/docs/components/accordion/llms.txt) - Collapsible sections

### Form Components
- [Form](/docs/components/form/llms.txt) - Auto-generated form from data
- [InputField](/docs/components/inputfield/llms.txt) - Labeled input with validation
- [CheckBox](/docs/components/checkbox/llms.txt) - Checkbox input
- [Toggle](/docs/components/toggle/llms.txt) - Toggle switch
- [Range](/docs/components/range/llms.txt) - Range slider
- [Rating](/docs/components/rating/llms.txt) - Star rating input

### Layout Components
- [Card](/docs/components/card/llms.txt) - Content card container
- [ResponsiveGrid](/docs/components/responsivegrid/llms.txt) - Responsive grid layout

### Navigation Components
- [BreadCrumbs](/docs/components/breadcrumbs/llms.txt) - Breadcrumb navigation
- [DropDown](/docs/components/dropdown/llms.txt) - Dropdown menu
- [Stepper](/docs/components/stepper/llms.txt) - Step indicator

### Feedback Components
- [ProgressBar](/docs/components/progressbar/llms.txt) - Progress indicator
- [ValidationReport](/docs/components/validationreport/llms.txt) - Validation messages

## Proxy System

Components use the Proxy system from \`@rokkit/states\` for data access:

\`\`\`svelte
<script>
  import { Proxy } from '@rokkit/states'

  // Proxy wraps items with field mapping
  let proxyItems = $derived(items.map(item => new Proxy(item, fields)))

  // Access mapped fields
  proxyItems[0].get('text')  // Returns mapped text field
  proxyItems[0].has('image') // Check if field exists
  proxyItems[0].id           // Unique identifier
</script>
\`\`\`

## Snippet Customization

Customize component rendering with snippets:

\`\`\`svelte
<List {items}>
  {#snippet child(node)}
    <div class="custom-item">
      <img src={node.get('image')} alt="" />
      <span>{node.get('text')}</span>
      <span class="badge">{node.value.category}</span>
    </div>
  {/snippet}
</List>
\`\`\`

### Common Snippets

| Snippet | Description |
|---------|-------------|
| \`child\` | Custom item renderer |
| \`header\` | Header content |
| \`footer\` | Footer content |
| \`empty\` | Empty state content |
| \`loading\` | Loading state content |

## Themes

Three built-in themes with dark/light mode support:

\`\`\`html
<html data-theme="rokkit" data-mode="dark">
\`\`\`

### Available Themes
- \`rokkit\` - Default distinctive theme
- \`minimal\` - Clean, minimal aesthetic
- \`material\` - Material Design inspired

### Theme Switching

\`\`\`svelte
<script>
  import { vibe } from '@rokkit/states'

  // Change theme
  vibe.style = 'minimal'

  // Change mode
  vibe.mode = 'dark'
</script>
\`\`\`

## Import Patterns

\`\`\`javascript
// Named imports from package
import { List, Tree, Tabs } from '@rokkit/ui'

// Default import for single component
import List from '@rokkit/ui/list'

// State management
import { Proxy, vibe } from '@rokkit/states'

// Actions
import { keyboard, themable } from '@rokkit/actions'

// Forms
import { Form, FormRenderer } from '@rokkit/ui'
\`\`\`

## Keyboard Navigation

All components support full keyboard navigation:

| Key | Action |
|-----|--------|
| \`Tab\` | Move focus between components |
| \`Arrow Up/Down\` | Navigate items |
| \`Arrow Left/Right\` | Expand/collapse (trees), navigate tabs |
| \`Enter/Space\` | Select/activate |
| \`Escape\` | Close overlays |
| \`Home/End\` | Jump to first/last item |

## Accessibility

All components include:
- Proper ARIA roles and attributes
- Keyboard navigation
- Focus management
- Screen reader announcements
- High contrast support

## Usage Guidelines

### Data-First Approach
Always let your data drive the component. Use field mapping instead of transforming data:

\`\`\`svelte
<!-- Good: Use field mapping -->
<List items={apiResponse} fields={{ text: 'title', value: 'id' }} />

<!-- Avoid: Transforming data -->
<List items={apiResponse.map(item => ({ label: item.title, id: item.id }))} />
\`\`\`

### Consistent Selection Pattern
All selection components use the same value binding:

\`\`\`svelte
<List {items} bind:value />
<Select {items} bind:value />
<Tabs {items} bind:value />
\`\`\`

### Snippet Customization
Use snippets for custom rendering instead of wrapper components:

\`\`\`svelte
<List {items}>
  {#snippet child(node)}
    <MyCustomItem data={node.value} />
  {/snippet}
</List>
\`\`\`

## More Information

- Documentation: https://rokkit.dev
- GitHub: https://github.com/jerrythomas/rokkit
- Component docs: /docs/components/{component}/llms.txt
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
