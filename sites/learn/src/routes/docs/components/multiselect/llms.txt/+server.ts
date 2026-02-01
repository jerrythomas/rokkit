import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit MultiSelect Component

> Data-driven multi-selection dropdown with pill display for selected items.

The MultiSelect component allows users to select multiple items from a dropdown list. Selected items are displayed as removable pills/tags above the dropdown.

## Quick Start

\`\`\`svelte
<script>
  import { MultiSelect } from '@rokkit/ui'

  let options = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry']
  let value = $state([])
</script>

<MultiSelect {options} bind:value placeholder="Select fruits..." />
\`\`\`

## Core Concepts

### Data-Driven Design

MultiSelect adapts to your data structure through field mapping:

\`\`\`svelte
<script>
  const users = [
    { id: 1, name: 'Alice', role: 'Admin' },
    { id: 2, name: 'Bob', role: 'User' },
    { id: 3, name: 'Charlie', role: 'User' }
  ]

  const fields = {
    text: 'name',
    value: 'id'
  }

  let selectedUsers = $state([])
</script>

<MultiSelect options={users} {fields} bind:value={selectedUsers} />
\`\`\`

### Selection Behavior

- Selected items are removed from the dropdown options
- Selected items appear as pills above the dropdown
- Each pill has a remove button to deselect
- Value is an array of selected items

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`options\` | \`array\` | \`[]\` | Array of available options |
| \`value\` | \`array\` | \`[]\` | Selected items array (use \`bind:value\`) |
| \`fields\` | \`object\` | \`{}\` | Field mapping configuration |
| \`placeholder\` | \`string\` | \`''\` | Text when no items selected |
| \`name\` | \`string\` | \`null\` | Form input name |
| \`class\` | \`string\` | \`''\` | CSS class names |
| \`open\` | \`boolean\` | \`false\` | Dropdown open state (use \`bind:open\`) |
| \`disabled\` | \`boolean\` | \`false\` | Disables the multiselect |
| \`direction\` | \`'up' \\| 'down' \\| 'auto'\` | \`'auto'\` | Dropdown opening direction |
| \`searchable\` | \`boolean\` | \`false\` | Enables search/filter input |
| \`searchText\` | \`string\` | \`''\` | Current search text (use \`bind:searchText\`) |
| \`searchPlaceholder\` | \`string\` | \`'Search...'\` | Placeholder for search input |
| \`filterFn\` | \`function\` | \`undefined\` | Custom filter function |

## Field Mapping

Map your data fields to component expectations:

| Field | Default | Description |
|-------|---------|-------------|
| \`text\` | \`'text'\` | Display text in dropdown and pills |
| \`value\` | \`'value'\` | Item value for comparison |
| \`icon\` | \`'icon'\` | Icon for each option |
| \`image\` | \`'image'\` | Image for each option |

### Field Mapping Example

\`\`\`svelte
<script>
  const tags = [
    { tagId: 'js', label: 'JavaScript', color: '#f7df1e' },
    { tagId: 'ts', label: 'TypeScript', color: '#3178c6' },
    { tagId: 'svelte', label: 'Svelte', color: '#ff3e00' }
  ]

  const fields = {
    text: 'label',
    value: 'tagId'
  }

  let selectedTags = $state([])
</script>

<MultiSelect options={tags} {fields} bind:value={selectedTags} />
\`\`\`

## Component Structure

\`\`\`
<multi-select>
├── <items>                    // Selected items as pills (when value.length > 0)
│   └── <Item removable>       // Each selected item with remove button
│       ├── Content            // Item text/icon/image
│       └── <Icon close>       // Remove button
├── <item>                     // Placeholder (when value.length === 0)
│   └── Placeholder text
└── <Select>                   // Dropdown for remaining options
    └── <List>                 // Available options
\`\`\`

## Keyboard Navigation

The dropdown uses the same keyboard navigation as Select:

| Key | Action |
|-----|--------|
| \`ArrowDown\` | Open dropdown / Next option |
| \`ArrowUp\` | Open dropdown / Previous option |
| \`Enter\` | Select focused option |
| \`Escape\` | Close dropdown |

## Removing Selected Items

Click the remove icon (×) on any pill to deselect that item:

\`\`\`svelte
<script>
  let value = $state(['Apple', 'Banana'])

  // Clicking × on 'Apple' pill removes it from value
  // value becomes ['Banana']
</script>

<MultiSelect {options} bind:value />
\`\`\`

## Available Options Filtering

The dropdown automatically filters out already-selected items:

\`\`\`javascript
// Internal logic
available = options.filter((item) => !value.includes(item))
\`\`\`

This ensures users can only select each item once.

## Searchable MultiSelect

Enable search/filter functionality for large option lists:

### Basic Searchable

\`\`\`svelte
<script>
  import { MultiSelect } from '@rokkit/ui'

  const allSkills = [
    { id: 'js', name: 'JavaScript' },
    { id: 'ts', name: 'TypeScript' },
    { id: 'py', name: 'Python' },
    { id: 'go', name: 'Go' },
    { id: 'rust', name: 'Rust' },
    { id: 'java', name: 'Java' },
    { id: 'csharp', name: 'C#' },
    { id: 'cpp', name: 'C++' }
  ]

  let selectedSkills = $state([])
</script>

<MultiSelect
  options={allSkills}
  fields={{ text: 'name', value: 'id' }}
  bind:value={selectedSkills}
  searchable
  searchPlaceholder="Search skills..."
  placeholder="Select skills"
/>
\`\`\`

### Custom Filter Function

\`\`\`svelte
<script>
  import { MultiSelect } from '@rokkit/ui'

  const employees = [
    { id: 1, name: 'Alice Smith', dept: 'Engineering' },
    { id: 2, name: 'Bob Jones', dept: 'Marketing' },
    { id: 3, name: 'Charlie Brown', dept: 'Engineering' }
  ]

  // Search by name or department
  function customFilter(item, searchText) {
    const search = searchText.toLowerCase()
    return item.name.toLowerCase().includes(search) ||
           item.dept.toLowerCase().includes(search)
  }

  let team = $state([])
</script>

<MultiSelect
  options={employees}
  fields={{ text: 'name', value: 'id' }}
  bind:value={team}
  searchable
  filterFn={customFilter}
/>
\`\`\`

## Dropdown Direction

Control which direction the dropdown opens:

\`\`\`svelte
<!-- Auto-detect best direction (default) -->
<MultiSelect {options} direction="auto" />

<!-- Always open upward -->
<MultiSelect {options} direction="up" />

<!-- Always open downward -->
<MultiSelect {options} direction="down" />
\`\`\`

## Data Attributes for Styling

| Element | Selector | Description |
|---------|----------|-------------|
| Root | \`multi-select\` | Main container |
| Pills | \`items\` | Selected items container |
| Pill | \`Item.pill\` | Individual selected item |
| Placeholder | \`item\` | Shown when no selection |

### Styling Example

\`\`\`css
multi-select {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

multi-select items {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

multi-select :global(.pill) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--primary-100);
  color: var(--primary-700);
  border-radius: 16px;
  font-size: 0.875rem;
}

multi-select :global(.pill) :global([data-icon-remove]) {
  cursor: pointer;
  opacity: 0.7;
}

multi-select :global(.pill) :global([data-icon-remove]):hover {
  opacity: 1;
}

multi-select item {
  color: var(--text-muted);
  padding: 8px;
}
\`\`\`

## Import

\`\`\`javascript
// Named import
import { MultiSelect } from '@rokkit/ui'

// Default import
import MultiSelect from '@rokkit/ui/multi-select'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface MultiSelectProps {
  options?: any[]
  value?: any[]
  fields?: FieldMapping
  placeholder?: string
  name?: string
  class?: string
  open?: boolean
  disabled?: boolean
  direction?: 'up' | 'down' | 'auto'
  searchable?: boolean
  searchText?: string
  searchPlaceholder?: string
  filterFn?: (item: any, searchText: string, fields: FieldMapping) => boolean
}

interface FieldMapping {
  text?: string
  value?: string
  icon?: string
  image?: string
  [key: string]: string | undefined
}
\`\`\`

## Examples

### Simple String Array

\`\`\`svelte
<script>
  import { MultiSelect } from '@rokkit/ui'

  let colors = ['Red', 'Green', 'Blue', 'Yellow', 'Purple']
  let favorites = $state([])
</script>

<MultiSelect options={colors} bind:value={favorites} placeholder="Pick colors" />

<p>Selected: {favorites.join(', ')}</p>
\`\`\`

### Object Array with Field Mapping

\`\`\`svelte
<script>
  import { MultiSelect } from '@rokkit/ui'

  const skills = [
    { id: 'js', name: 'JavaScript' },
    { id: 'ts', name: 'TypeScript' },
    { id: 'svelte', name: 'Svelte' },
    { id: 'react', name: 'React' },
    { id: 'vue', name: 'Vue' }
  ]

  const fields = { text: 'name', value: 'id' }
  let userSkills = $state([])
</script>

<MultiSelect options={skills} {fields} bind:value={userSkills} />
\`\`\`

### With Icons

\`\`\`svelte
<script>
  const categories = [
    { name: 'Work', icon: 'briefcase' },
    { name: 'Personal', icon: 'user' },
    { name: 'Shopping', icon: 'cart' },
    { name: 'Health', icon: 'heart' }
  ]

  const fields = { text: 'name', icon: 'icon' }
  let selected = $state([])
</script>

<MultiSelect options={categories} {fields} bind:value={selected} />
\`\`\`

### Pre-selected Values

\`\`\`svelte
<script>
  const options = ['Draft', 'In Review', 'Approved', 'Published']
  let statuses = $state(['Draft', 'In Review'])
</script>

<MultiSelect {options} bind:value={statuses} placeholder="Filter by status" />
\`\`\`

### Form Integration

\`\`\`svelte
<script>
  let formData = $state({
    name: '',
    tags: []
  })

  const tagOptions = ['Important', 'Urgent', 'Review', 'Follow-up']
</script>

<form onsubmit={handleSubmit}>
  <input bind:value={formData.name} placeholder="Name" />

  <MultiSelect
    options={tagOptions}
    bind:value={formData.tags}
    name="tags"
    placeholder="Add tags"
  />

  <button type="submit">Save</button>
</form>
\`\`\`

### Controlled Selection

\`\`\`svelte
<script>
  let options = ['A', 'B', 'C', 'D', 'E']
  let value = $state(['A', 'B'])

  function selectAll() {
    value = [...options]
  }

  function clearAll() {
    value = []
  }
</script>

<div class="controls">
  <button onclick={selectAll}>Select All</button>
  <button onclick={clearAll}>Clear</button>
</div>

<MultiSelect {options} bind:value />
\`\`\`

## Comparison with Select

| Aspect | Select | MultiSelect |
|--------|--------|-------------|
| Selection | Single item | Multiple items |
| Value type | Single value | Array |
| Display | Shows selected in trigger | Pills + dropdown |
| Options | All always visible | Selected filtered out |

## Related Components

- **Select** - Single selection dropdown
- **SearchFilter** - Standalone search/filter for List or Tree components
- **List** - Base list component with selection
- **CheckBox** - Individual boolean toggle
- **Item** - Used for pill rendering
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
