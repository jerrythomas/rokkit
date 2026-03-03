import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit TreeTable Component

> Hierarchical data table with expand/collapse functionality for flat path-based data.

The TreeTable component displays tabular data with hierarchical relationships. It automatically detects parent/child relationships from flat data using path-based values (like file paths or category hierarchies).

## Quick Start

\`\`\`svelte
<script>
  import { TreeTable } from '@rokkit/ui'

  let data = [
    { path: 'Documents', size: '-', type: 'folder' },
    { path: 'Documents/Report.pdf', size: '2.4 MB', type: 'file' },
    { path: 'Documents/Notes.txt', size: '12 KB', type: 'file' },
    { path: 'Images', size: '-', type: 'folder' },
    { path: 'Images/Photo.jpg', size: '3.1 MB', type: 'file' }
  ]

  let columns = [
    { field: 'path', label: 'Name', hierarchy: true },
    { field: 'size', label: 'Size' },
    { field: 'type', label: 'Type' }
  ]
</script>

<TreeTable {data} {columns} />
\`\`\`

## Core Concepts

### Flat Data with Path Hierarchy

TreeTable works with flat arrays where hierarchy is encoded in a path field:

\`\`\`javascript
// Flat data with path-based hierarchy
const data = [
  { category: 'Electronics', revenue: 50000 },
  { category: 'Electronics/Phones', revenue: 30000 },
  { category: 'Electronics/Phones/iPhone', revenue: 20000 },
  { category: 'Electronics/Phones/Android', revenue: 10000 },
  { category: 'Electronics/Laptops', revenue: 20000 },
  { category: 'Clothing', revenue: 25000 }
]

// Column marks which field contains the hierarchy
const columns = [
  { field: 'category', label: 'Category', hierarchy: true },
  { field: 'revenue', label: 'Revenue', format: (v) => '$' + v.toLocaleString() }
]
\`\`\`

### Automatic Hierarchy Detection

The component automatically:
1. Identifies parent/child relationships from paths
2. Calculates depth levels
3. Manages expand/collapse state
4. Handles visibility of nested rows

### Path Separator

By default, paths use "/" as separator. Customize with the \`separator\` property:

\`\`\`javascript
const columns = [
  { field: 'path', label: 'Path', hierarchy: true, separator: '.' },
  // ...
]

// Data using dot separator
const data = [
  { path: 'root', name: 'Root' },
  { path: 'root.child1', name: 'Child 1' },
  { path: 'root.child1.grandchild', name: 'Grandchild' }
]
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`data\` | \`array\` | \`[]\` | Flat data array with path-based hierarchy |
| \`columns\` | \`array\` | \`[]\` | Column definitions |
| \`fields\` | \`object\` | \`{}\` | Field mapping configuration |
| \`value\` | \`any\` | \`null\` | Selected row (use \`bind:value\`) |
| \`selected\` | \`array\` | \`[]\` | Selected rows for multi-select |
| \`multiSelect\` | \`boolean\` | \`false\` | Enable multi-row selection |
| \`striped\` | \`boolean\` | \`true\` | Alternating row colors |
| \`expanded\` | \`boolean\` | \`true\` | Initial expansion state |
| \`class\` | \`string\` | \`''\` | CSS class names |

## Column Definition

Each column object supports:

| Property | Type | Description |
|----------|------|-------------|
| \`field\` | \`string\` | Data field key |
| \`key\` | \`string\` | Alias for field |
| \`label\` | \`string\` | Column header text |
| \`width\` | \`string\` | Column width (CSS value) |
| \`hierarchy\` | \`boolean\` | Marks this as the hierarchy column |
| \`separator\` | \`string\` | Path separator (default: '/') |
| \`format\` | \`function\` | Cell value formatter |

### Column Examples

\`\`\`javascript
const columns = [
  // Hierarchy column with custom separator
  {
    field: 'path',
    label: 'Location',
    hierarchy: true,
    separator: '/'
  },

  // Fixed width column
  {
    field: 'size',
    label: 'Size',
    width: '100px'
  },

  // Formatted column
  {
    field: 'date',
    label: 'Modified',
    format: (value) => new Date(value).toLocaleDateString()
  },

  // Formatted with row access
  {
    field: 'status',
    label: 'Status',
    format: (value, row) => row.isActive ? 'Active' : 'Inactive'
  }
]
\`\`\`

## Events

| Handler | Payload | Description |
|---------|---------|-------------|
| \`onselect\` | \`row\` | Row selected |
| \`onchange\` | \`row\` | Selection changed |
| \`onexpand\` | \`row\` | Parent row expanded |
| \`oncollapse\` | \`row\` | Parent row collapsed |

### Event Handling

\`\`\`svelte
<script>
  function handleSelect(row) {
    console.log('Selected:', row)
  }

  function handleExpand(row) {
    console.log('Expanded:', row)
  }

  function handleCollapse(row) {
    console.log('Collapsed:', row)
  }
</script>

<TreeTable
  {data}
  {columns}
  onselect={handleSelect}
  onexpand={handleExpand}
  oncollapse={handleCollapse}
/>
\`\`\`

## Component Structure

\`\`\`
<div data-tree-table>
└── <table>
    ├── <thead>
    │   └── <tr>
    │       └── <th data-column>     // For each column
    └── <tbody>
        └── <tr data-row>            // For each visible row
            └── <td data-column>     // For each column
                └── <div data-cell>
                    ├── <span data-indent>   // Hierarchy indentation
                    ├── <Icon>               // Expand/collapse (parents)
                    └── <span data-cell-value>
\`\`\`

## Data Attributes for Styling

| Attribute | Element | Purpose |
|-----------|---------|---------|
| \`data-tree-table\` | Root div | Main container |
| \`data-column\` | th, td | Column identifier |
| \`data-row\` | tr | Row element |
| \`data-depth\` | tr | Hierarchy depth (0, 1, 2...) |
| \`data-cell\` | div | Cell content wrapper |
| \`data-indent\` | span | Indentation spacer |
| \`data-cell-value\` | span | Cell value |
| \`aria-selected\` | tr | Selection state |
| \`aria-expanded\` | tr | Expansion state (parents) |

### Styling Example

\`\`\`css
[data-tree-table] {
  width: 100%;
  overflow-x: auto;
}

[data-tree-table] table {
  width: 100%;
  border-collapse: collapse;
}

[data-tree-table] th {
  text-align: left;
  padding: 12px 8px;
  background: var(--surface-100);
  border-bottom: 2px solid var(--border-color);
  font-weight: 600;
}

[data-tree-table] td {
  padding: 8px;
  border-bottom: 1px solid var(--border-color);
}

[data-tree-table] table.striped tr:nth-child(even) td {
  background: var(--surface-50);
}

[data-tree-table] [data-row][aria-selected="true"] td {
  background: var(--primary-100);
}

[data-tree-table] [data-row]:hover td {
  background: var(--surface-100);
}

[data-tree-table] [data-indent] {
  display: inline-block;
  width: 24px;
}

[data-tree-table] [data-cell] {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Style by depth */
[data-tree-table] [data-row][data-depth="0"] {
  font-weight: 600;
}

[data-tree-table] [data-row][data-depth="1"] {
  font-weight: 500;
}
\`\`\`

## Import

\`\`\`javascript
// Named import
import { TreeTable } from '@rokkit/ui'

// Default import
import TreeTable from '@rokkit/ui/tree-table'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface TreeTableProps {
  data?: any[]
  columns?: ColumnDefinition[]
  fields?: FieldMapping
  value?: any
  selected?: any[]
  multiSelect?: boolean
  striped?: boolean
  expanded?: boolean
  class?: string
  onselect?: (row: any) => void
  onchange?: (row: any) => void
  onexpand?: (row: any) => void
  oncollapse?: (row: any) => void
}

interface ColumnDefinition {
  field?: string
  key?: string
  label?: string
  width?: string
  hierarchy?: boolean
  separator?: string
  format?: (value: any, row: any) => string
}
\`\`\`

## Examples

### File Explorer

\`\`\`svelte
<script>
  import { TreeTable } from '@rokkit/ui'

  let files = [
    { path: 'src', size: '-', modified: '2024-01-15' },
    { path: 'src/components', size: '-', modified: '2024-01-14' },
    { path: 'src/components/Button.svelte', size: '2.4 KB', modified: '2024-01-14' },
    { path: 'src/components/Input.svelte', size: '1.8 KB', modified: '2024-01-13' },
    { path: 'src/utils', size: '-', modified: '2024-01-12' },
    { path: 'src/utils/helpers.js', size: '4.2 KB', modified: '2024-01-12' },
    { path: 'package.json', size: '1.2 KB', modified: '2024-01-15' }
  ]

  let columns = [
    { field: 'path', label: 'Name', hierarchy: true },
    { field: 'size', label: 'Size', width: '100px' },
    { field: 'modified', label: 'Modified', width: '120px' }
  ]

  let selectedFile = $state(null)
</script>

<TreeTable data={files} {columns} bind:value={selectedFile} />

{#if selectedFile}
  <p>Selected: {selectedFile.path}</p>
{/if}
\`\`\`

### Category Revenue

\`\`\`svelte
<script>
  import { TreeTable } from '@rokkit/ui'

  let sales = [
    { category: 'North America', q1: 150000, q2: 180000 },
    { category: 'North America/USA', q1: 100000, q2: 120000 },
    { category: 'North America/USA/East', q1: 60000, q2: 70000 },
    { category: 'North America/USA/West', q1: 40000, q2: 50000 },
    { category: 'North America/Canada', q1: 50000, q2: 60000 },
    { category: 'Europe', q1: 120000, q2: 140000 },
    { category: 'Europe/UK', q1: 70000, q2: 80000 },
    { category: 'Europe/Germany', q1: 50000, q2: 60000 }
  ]

  const formatCurrency = (value) => '$' + value.toLocaleString()

  let columns = [
    { field: 'category', label: 'Region', hierarchy: true },
    { field: 'q1', label: 'Q1 Sales', format: formatCurrency },
    { field: 'q2', label: 'Q2 Sales', format: formatCurrency }
  ]
</script>

<TreeTable data={sales} {columns} />
\`\`\`

### Dot-Separated Paths

\`\`\`svelte
<script>
  import { TreeTable } from '@rokkit/ui'

  // Package structure with dot notation
  let packages = [
    { name: 'com', classes: 5 },
    { name: 'com.example', classes: 10 },
    { name: 'com.example.models', classes: 8 },
    { name: 'com.example.services', classes: 12 },
    { name: 'com.example.utils', classes: 6 }
  ]

  let columns = [
    { field: 'name', label: 'Package', hierarchy: true, separator: '.' },
    { field: 'classes', label: 'Classes' }
  ]
</script>

<TreeTable data={packages} {columns} />
\`\`\`

### Initially Collapsed

\`\`\`svelte
<script>
  import { TreeTable } from '@rokkit/ui'
</script>

<!-- Start with all nodes collapsed -->
<TreeTable {data} {columns} expanded={false} />
\`\`\`

### With Row Selection

\`\`\`svelte
<script>
  import { TreeTable } from '@rokkit/ui'

  let tasks = [
    { path: 'Sprint 1', status: 'complete', assignee: '-' },
    { path: 'Sprint 1/Task A', status: 'complete', assignee: 'Alice' },
    { path: 'Sprint 1/Task B', status: 'complete', assignee: 'Bob' },
    { path: 'Sprint 2', status: 'in-progress', assignee: '-' },
    { path: 'Sprint 2/Task C', status: 'in-progress', assignee: 'Charlie' },
    { path: 'Sprint 2/Task D', status: 'pending', assignee: 'Alice' }
  ]

  let columns = [
    { field: 'path', label: 'Task', hierarchy: true },
    { field: 'status', label: 'Status' },
    { field: 'assignee', label: 'Assignee' }
  ]

  let selected = $state(null)

  function handleSelect(row) {
    console.log('Selected task:', row.path)
  }
</script>

<TreeTable
  data={tasks}
  {columns}
  bind:value={selected}
  onselect={handleSelect}
/>
\`\`\`

### Controlled Expansion

\`\`\`svelte
<script>
  import { TreeTable } from '@rokkit/ui'

  let expanded = $state(true)

  function expandAll() {
    expanded = true
  }

  function collapseAll() {
    expanded = false
  }
</script>

<div class="controls">
  <button onclick={expandAll}>Expand All</button>
  <button onclick={collapseAll}>Collapse All</button>
</div>

<TreeTable {data} {columns} bind:expanded />
\`\`\`

## When to Use TreeTable

| Scenario | Use TreeTable |
|----------|--------------|
| Hierarchical tabular data | ✅ |
| File/folder structure with metadata | ✅ |
| Organizational charts with data | ✅ |
| Category breakdowns with values | ✅ |
| Simple list data | ❌ Use List |
| Pure tree navigation | ❌ Use Tree |
| Flat tabular data | ❌ Use Table |

## Related Components

- **Tree** - Hierarchical navigation without table columns
- **List** - Simple flat list display
- **Table** - Flat tabular data (not hierarchical)
- **Accordion** - Collapsible sections without table structure
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
