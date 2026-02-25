import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit SearchFilter Component

> Standalone search/filter component for filtering List, Tree, or custom data displays.

The SearchFilter component provides a reusable search input that filters data arrays. Use it when you need search functionality separate from selection components, such as filtering a List or Tree display.

## Quick Start

\`\`\`svelte
<script>
  import { SearchFilter, List } from '@rokkit/ui'

  let items = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry']
  let filtered = $state([])
</script>

<SearchFilter {items} bind:filtered placeholder="Search fruits..." />
<List items={filtered} />
\`\`\`

## Core Concepts

### Composition Pattern

SearchFilter is designed to work alongside display components rather than being built into them. This separation provides flexibility:

\`\`\`svelte
<script>
  import { SearchFilter, List } from '@rokkit/ui'

  let users = [
    { id: 1, name: 'Alice', role: 'Admin' },
    { id: 2, name: 'Bob', role: 'User' },
    { id: 3, name: 'Charlie', role: 'User' }
  ]

  const fields = { text: 'name' }
  let filtered = $state([])
  let selected = $state(null)
</script>

<SearchFilter items={users} {fields} bind:filtered />
<List items={filtered} {fields} bind:value={selected} />
\`\`\`

### Field Mapping

SearchFilter uses the same field mapping system as other Rokkit components to determine which fields to search:

\`\`\`svelte
<script>
  const products = [
    { sku: 'A001', title: 'Widget', description: 'A useful widget' },
    { sku: 'B002', title: 'Gadget', description: 'A cool gadget' }
  ]

  // Search will look in the 'title' field (mapped to 'text')
  const fields = { text: 'title' }
</script>

<SearchFilter items={products} {fields} bind:filtered />
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`items\` | \`array\` | \`[]\` | Source data array to filter |
| \`filtered\` | \`array\` | \`[]\` | Filtered results (use \`bind:filtered\`) |
| \`fields\` | \`object\` | \`{}\` | Field mapping configuration |
| \`searchText\` | \`string\` | \`''\` | Current search text (use \`bind:searchText\`) |
| \`placeholder\` | \`string\` | \`'Search...'\` | Input placeholder text |
| \`filterFn\` | \`function\` | \`undefined\` | Custom filter function |
| \`caseSensitive\` | \`boolean\` | \`false\` | Case-sensitive matching |
| \`class\` | \`string\` | \`''\` | CSS class names |
| \`children\` | \`Snippet\` | \`undefined\` | Custom content after input |

## Field Mapping

The default filter searches the \`text\` field:

| Field | Default | Description |
|-------|---------|-------------|
| \`text\` | \`'text'\` | Primary field to search |

### Custom Field Mapping

\`\`\`svelte
<script>
  const items = [
    { productName: 'Widget', category: 'Tools' },
    { productName: 'Gadget', category: 'Electronics' }
  ]

  // Search in 'productName' field
  const fields = { text: 'productName' }
</script>

<SearchFilter items={items} {fields} bind:filtered />
\`\`\`

## Custom Filter Function

For advanced filtering, provide a custom filter function:

### Signature

\`\`\`typescript
filterFn: (item: any, searchText: string, fields: FieldMapping) => boolean
\`\`\`

### Multi-Field Search

\`\`\`svelte
<script>
  import { SearchFilter, List } from '@rokkit/ui'

  const employees = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', dept: 'Engineering' },
    { id: 2, name: 'Bob Jones', email: 'bob@example.com', dept: 'Marketing' }
  ]

  // Search across multiple fields
  function multiFieldFilter(item, searchText) {
    const search = searchText.toLowerCase()
    return item.name.toLowerCase().includes(search) ||
           item.email.toLowerCase().includes(search) ||
           item.dept.toLowerCase().includes(search)
  }

  let filtered = $state([])
</script>

<SearchFilter
  items={employees}
  bind:filtered
  filterFn={multiFieldFilter}
  placeholder="Search by name, email, or department..."
/>
<List items={filtered} fields={{ text: 'name' }} />
\`\`\`

### Fuzzy Matching

\`\`\`svelte
<script>
  // Simple fuzzy match: all characters must appear in order
  function fuzzyFilter(item, searchText, fields) {
    const text = (item[fields.text || 'text'] || '').toLowerCase()
    const search = searchText.toLowerCase()

    let searchIndex = 0
    for (const char of text) {
      if (char === search[searchIndex]) {
        searchIndex++
        if (searchIndex === search.length) return true
      }
    }
    return false
  }
</script>

<SearchFilter items={items} filterFn={fuzzyFilter} bind:filtered />
\`\`\`

## Case Sensitivity

By default, search is case-insensitive:

\`\`\`svelte
<!-- Case-insensitive (default) -->
<SearchFilter items={items} bind:filtered />

<!-- Case-sensitive -->
<SearchFilter items={items} bind:filtered caseSensitive />
\`\`\`

## Controlled Search Text

Access and control the search text for external logic:

\`\`\`svelte
<script>
  let searchText = $state('')
  let filtered = $state([])

  function clearSearch() {
    searchText = ''
  }

  // React to search changes
  $effect(() => {
    console.log('Searching for:', searchText)
    console.log('Results:', filtered.length)
  })
</script>

<SearchFilter
  items={items}
  bind:filtered
  bind:searchText
/>

<button onclick={clearSearch}>Clear</button>
<p>{filtered.length} results for "{searchText}"</p>
\`\`\`

## Component Structure

\`\`\`
<search-filter>
├── <input type="text">    // Search input
└── {children}             // Optional custom content
</search-filter>
\`\`\`

## Data Attributes for Styling

| Attribute | Element | Purpose |
|-----------|---------|---------|
| \`search-filter\` | Root | Main container |

### Styling Example

\`\`\`css
search-filter {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

search-filter input {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
}

search-filter input:focus {
  outline: none;
  border-color: var(--focus-color);
  box-shadow: 0 0 0 2px var(--focus-ring);
}

search-filter input::placeholder {
  color: var(--text-muted);
}
\`\`\`

## Import

\`\`\`javascript
// Named import
import { SearchFilter } from '@rokkit/ui'

// Default import
import SearchFilter from '@rokkit/ui/search-filter'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface SearchFilterProps {
  items?: any[]
  filtered?: any[]
  fields?: FieldMapping
  searchText?: string
  placeholder?: string
  filterFn?: (item: any, searchText: string, fields: FieldMapping) => boolean
  caseSensitive?: boolean
  class?: string
  children?: Snippet
}

interface FieldMapping {
  text?: string
  [key: string]: string | undefined
}
\`\`\`

## Examples

### Basic List Filtering

\`\`\`svelte
<script>
  import { SearchFilter, List } from '@rokkit/ui'

  let fruits = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry', 'Cranberry']
  let filtered = $state([])
</script>

<SearchFilter items={fruits} bind:filtered placeholder="Filter fruits..." />
<List items={filtered} />
\`\`\`

### Tree Filtering

\`\`\`svelte
<script>
  import { SearchFilter, Tree } from '@rokkit/ui'

  let files = [
    { name: 'src', children: [
      { name: 'components', children: [
        { name: 'Button.svelte' },
        { name: 'Input.svelte' }
      ]},
      { name: 'utils', children: [
        { name: 'helpers.js' }
      ]}
    ]},
    { name: 'package.json' }
  ]

  // Flatten for search, display filtered tree
  let allNodes = flattenTree(files)
  let filtered = $state([])
</script>

<SearchFilter items={allNodes} fields={{ text: 'name' }} bind:filtered />
<Tree items={filtered} fields={{ text: 'name', children: 'children' }} />
\`\`\`

### With Display Count

\`\`\`svelte
<script>
  import { SearchFilter, List } from '@rokkit/ui'

  let items = Array.from({ length: 100 }, (_, i) => \`Item \${i + 1}\`)
  let filtered = $state([])
  let searchText = $state('')
</script>

<div class="filter-container">
  <SearchFilter {items} bind:filtered bind:searchText />

  {#if searchText}
    <span class="count">
      {filtered.length} of {items.length} items
    </span>
  {/if}
</div>

<List items={filtered} />
\`\`\`

### Debounced Search

\`\`\`svelte
<script>
  import { SearchFilter, List } from '@rokkit/ui'

  let items = largeDataSet
  let filtered = $state([])
  let searchText = $state('')
  let debouncedText = $state('')

  // Debounce search for performance
  let timeout
  $effect(() => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedText = searchText
    }, 300)
  })
</script>

<SearchFilter {items} bind:filtered searchText={debouncedText} bind:searchText />
<List items={filtered} />
\`\`\`

### Combined with Selection

\`\`\`svelte
<script>
  import { SearchFilter, List } from '@rokkit/ui'

  let users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' }
  ]

  const fields = { text: 'name', value: 'id' }
  let filtered = $state([])
  let selected = $state(null)
</script>

<SearchFilter items={users} {fields} bind:filtered placeholder="Find user..." />

<List items={filtered} {fields} bind:value={selected}>
  {#snippet child(node)}
    <div class="user-item">
      <span class="name">{node.get('text')}</span>
      <span class="email">{node.value.email}</span>
    </div>
  {/snippet}
</List>

{#if selected}
  <p>Selected: {selected.name}</p>
{/if}
\`\`\`

## When to Use SearchFilter vs Searchable Props

| Scenario | Use SearchFilter | Use searchable prop |
|----------|------------------|---------------------|
| List display (no selection) | ✅ | N/A |
| Tree display | ✅ | N/A |
| Custom data display | ✅ | N/A |
| Select dropdown | ❌ | ✅ |
| MultiSelect dropdown | ❌ | ✅ |
| Need search separate from display | ✅ | ❌ |

## Related Components

- **Select** - Single selection with built-in searchable option
- **MultiSelect** - Multi selection with built-in searchable option
- **List** - Common pairing for filtered display
- **Tree** - Common pairing for filtered hierarchical display
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
