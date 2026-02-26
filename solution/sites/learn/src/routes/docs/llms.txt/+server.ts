import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit UI Component Library

> Data-driven, accessible UI components for Svelte 5

Rokkit is a component library built around the principle that **data should drive the interface**. Components adapt to any data structure via field mapping — no transformation required. All selection components share a consistent API: \`options\`/\`items\`, \`value\`, \`fields\`, callbacks.

## Packages

| Package | Description |
|---------|-------------|
| \`@rokkit/ui\` | Main UI components (30+ components) |
| \`@rokkit/forms\` | Dynamic form generation from JSON schema |
| \`@rokkit/states\` | State management (ItemProxy, ListController, NestedController) |
| \`@rokkit/actions\` | Svelte actions (navigator, hoverLift, magnetic, ripple) |
| \`@rokkit/core\` | Core utilities and field mapping |
| \`@rokkit/data\` | Data manipulation utilities |
| \`@rokkit/themes\` | CSS themes (rokkit, minimal, material) |
| \`@rokkit/icons\` | Icon system with Iconify integration |

## Quick Start

\`\`\`svelte
<script>
  import { List, Select, Table } from '@rokkit/ui'

  const users = [
    { id: 1, name: 'Alice', role: 'Admin' },
    { id: 2, name: 'Bob',   role: 'User' }
  ]

  let value = $state(null)
</script>

<List items={users} bind:value fields={{ text: 'name' }} />
\`\`\`

## Standard API Pattern

Most selection components share this pattern:

\`\`\`svelte
<Component
  options={data}           <!-- or items= -->
  bind:value               <!-- selected value (bindable) -->
  fields={{ text: 'name' }} <!-- map data fields to component expectations -->
  onchange={(v, item) => {}} <!-- selection callback -->
/>
\`\`\`

## Field Mapping System

Map any data structure without transforming data:

\`\`\`svelte
<script>
  // Your data uses different field names
  const users = [
    { userId: 1, fullName: 'Alice', avatarUrl: '/alice.jpg' }
  ]

  // Tell the component where to find each value
  const fields = {
    value: 'userId',     // what to emit on selection
    text: 'fullName',    // what to display
    icon: 'avatarUrl'    // icon/image
  }
</script>

<Select options={users} {fields} bind:value />
\`\`\`

## Themes

\`\`\`html
<html data-theme="rokkit" data-mode="dark">
\`\`\`

Available themes: \`rokkit\` | \`minimal\` | \`material\`

## Component Index

### Selection & Navigation
- [List](/docs/components/list/llms.txt) — vertical list with selection, grouping, lazy loading
- [Tree](/docs/components/tree/llms.txt) — hierarchical tree view with expand/collapse
- [Select](/docs/components/select/llms.txt) — dropdown single-selection with typeahead filter
- [MultiSelect](/docs/components/multiselect/llms.txt) — dropdown multi-selection with pills
- [Toggle](/docs/components/toggle/llms.txt) — radio-style button group
- [Tabs](/docs/components/tabs/llms.txt) — tabbed content panels (horizontal/vertical)
- [Table](/docs/components/table/llms.txt) — sortable data table with row selection

### Menus & Actions
- [Menu](/docs/components/dropdown/llms.txt) — dropdown menu with grouped options
- [Toolbar](/docs/components/toolbar/llms.txt) — horizontal action bar with sections
- [FloatingActions](/docs/components/floating-actions/llms.txt) — floating action button (FAB)

### Form Inputs
- [Form](/docs/components/form/llms.txt) — schema-driven dynamic form
- [CheckBox](/docs/components/checkbox/llms.txt) — checkbox input
- [Switch](/docs/components/switch/llms.txt) — boolean on/off toggle
- [RadioGroup](/docs/components/radiogroup/llms.txt) — radio button group
- [Range](/docs/components/range/llms.txt) — range slider
- [Rating](/docs/components/rating/llms.txt) — star rating input
- [SearchFilter](/docs/components/search-filter/llms.txt) — structured filter parser

### Layout & Display
- [Card](/docs/components/card/llms.txt) — content card container
- [Accordion](/docs/components/accordion/llms.txt) — collapsible sections
- [Stepper](/docs/components/stepper/llms.txt) — step indicator / wizard progress
- [ProgressBar](/docs/components/progress-bar/llms.txt) — progress indicator
- [BreadCrumbs](/docs/components/breadcrumbs/llms.txt) — breadcrumb navigation

## Keyboard Navigation

All interactive components support:

| Key | Action |
|-----|--------|
| \`Tab\` | Move focus between components |
| \`ArrowUp/Down\` | Navigate items |
| \`ArrowLeft/Right\` | Expand/collapse or navigate tabs |
| \`Enter/Space\` | Select/activate |
| \`Escape\` | Close overlays |
| \`Home/End\` | Jump to first/last item |

## Import

\`\`\`javascript
import { List, Tree, Select, MultiSelect, Tabs, Toggle, Table, Toolbar, Menu } from '@rokkit/ui'
import { FloatingAction } from '@rokkit/ui'
import { Form, FormRenderer } from '@rokkit/forms'
\`\`\`
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	})
}
