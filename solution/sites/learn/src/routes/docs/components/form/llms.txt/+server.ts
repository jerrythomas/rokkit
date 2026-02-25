import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit Forms

> Data-driven form generation with schema and layout separation

Rokkit Forms follows a JSON-forms style architecture with separate data-schema and layout-schema for rendering dynamic forms.

## Quick Start

\`\`\`svelte
<script>
  import { Form } from '@rokkit/ui'
  let value = $state({
    name: 'John Doe',
    gender: 'male',
    email: 'john.doe@example.com',
    age: 30
  })
</script>

<Form bind:value />
\`\`\`

The simplest usage: pass a reactive \`value\` object and the Form auto-detects field types.

## Core Concepts

### Progressive Enhancement Layers

1. **Basic** - Auto-detect types from value object
2. **Schema** - Define field types, validation, options
3. **Layout** - Control arrangement with rows, columns, groups

### Two Schema Styles

**Array Schema** (simpler, field-centric):
\`\`\`javascript
const schema = [
  {
    key: 'name',
    label: 'Name',
    type: 'input',
    description: 'Enter your name',
    props: {
      type: 'text',
      required: true,
      minLength: 2
    }
  },
  {
    key: 'email',
    label: 'Email',
    type: 'input',
    props: {
      type: 'email',
      required: true
    }
  }
]
\`\`\`

**Object Schema** (JSON-schema style):
\`\`\`javascript
const schema = {
  type: 'object',
  properties: {
    first_name: { type: 'string', required: true },
    last_name: { type: 'string', required: true },
    gender: {
      type: 'enum',
      required: true,
      options: [
        { id: 'M', value: 'Male' },
        { id: 'F', value: 'Female' }
      ],
      fields: { value: 'id', text: 'value' }
    },
    age: { type: 'number', min: 18, max: 99 }
  }
}
\`\`\`

## Layout Schema

Controls visual arrangement of form fields.

\`\`\`javascript
const layout = {
  type: 'vertical',
  elements: [
    {
      title: 'Name',
      type: 'horizontal',
      elements: [
        { label: 'First Name', scope: '#/first_name' },
        { label: 'Last Name', scope: '#/last_name' }
      ]
    },
    { label: 'Gender', scope: '#/gender' },
    { label: 'Age', scope: '#/age' }
  ]
}
\`\`\`

### Layout Elements

| Element | Purpose |
|---------|---------|
| \`vertical\` | Stack fields vertically |
| \`horizontal\` | Arrange fields side-by-side |
| \`group\` | Logical field groupings |
| \`section\` | Major form sections |

### Layout Properties

| Property | Description |
|----------|-------------|
| \`scope\` | JSON pointer to field (\`#/fieldname\`) |
| \`label\` | Field label override |
| \`title\` | Section/group title |
| \`width\` | Field width (1-12 grid) |
| \`span\` | Column span |
| \`offset\` | Left margin spacing |

## Complete Example

\`\`\`svelte
<script>
  import { Form } from '@rokkit/ui'

  const schema = {
    type: 'object',
    properties: {
      first_name: { type: 'string', required: true },
      last_name: { type: 'string', required: true },
      gender: {
        type: 'enum',
        required: true,
        options: [
          { id: 'M', value: 'Male' },
          { id: 'F', value: 'Female' }
        ],
        fields: { value: 'id', text: 'value' }
      },
      age: { type: 'number', min: 18, max: 99 }
    }
  }

  const layout = {
    type: 'vertical',
    elements: [
      {
        title: 'Name',
        type: 'horizontal',
        elements: [
          { label: 'First Name', scope: '#/first_name' },
          { label: 'Last Name', scope: '#/last_name' }
        ]
      },
      { label: 'Gender', scope: '#/gender' },
      { label: 'Age', scope: '#/age' }
    ]
  }

  let value = $state({ first_name: '', last_name: '', gender: '', age: 25 })
</script>

<Form bind:value {schema} {layout} />
\`\`\`

## Field Types

### Basic Types
- \`string\` / \`text\` - Text input
- \`number\` - Numeric input with min/max
- \`email\` - Email validation
- \`date\` - Date picker
- \`boolean\` - Checkbox/toggle

### Selection Types
- \`enum\` - Dropdown/select with options
- \`radio\` - Radio button group
- \`checkbox\` - Multiple selection

### Options Configuration
\`\`\`javascript
{
  type: 'enum',
  options: [
    { id: 'value1', value: 'Display 1' },
    { id: 'value2', value: 'Display 2' }
  ],
  fields: { value: 'id', text: 'value' }
}
\`\`\`

## Validation

### Built-in Validators
- \`required\` - Field must have value
- \`minLength\` / \`maxLength\` - String length
- \`min\` / \`max\` - Numeric range
- \`pattern\` - Regex matching

### Validation Props
\`\`\`javascript
{
  key: 'age',
  type: 'input',
  props: {
    type: 'number',
    required: true,
    min: 18,
    max: 99
  }
}
\`\`\`

### Validation Timing
- \`onBlur\` - When user leaves field
- \`onChange\` - As user types
- \`onSubmit\` - When form submitted

## FormBuilder API

For programmatic form management:

\`\`\`javascript
import { FormBuilder } from '@rokkit/forms'

// Create with data only (auto-derive schema/layout)
const form = new FormBuilder(data)

// Create with schema override
const form = new FormBuilder(data, customSchema)

// Create with full control
const form = new FormBuilder(data, customSchema, customLayout)

// Create with lookups for dynamic options
const form = new FormBuilder(data, customSchema, customLayout, lookupConfigs)

// Access form state
form.data      // Current form data
form.schema    // Form schema
form.layout    // Form layout
form.elements  // Rendered elements

// Update field
form.setFieldValue('email', 'new@example.com')

// Validation
form.setFieldValidation('email', { state: 'error', text: 'Invalid email' })
form.clearValidation('email')

// Lookup management
form.hasLookup('country')           // Check if field has lookup
form.getLookupState('country')      // Get { options, loading, error }
await form.initializeLookups()      // Initialize all lookups
\`\`\`

## Dynamic Lookups

Lookups enable async data fetching for select/dropdown fields with caching and field dependencies.

### Basic Lookup

\`\`\`javascript
import { FormBuilder } from '@rokkit/forms'

const lookups = {
  country: {
    fetch: async () => {
      const response = await fetch('/api/countries')
      return response.json()
    },
    fields: { value: 'code', text: 'name' }
  }
}

const form = new FormBuilder(data, schema, layout, lookups)
await form.initializeLookups()
\`\`\`

### Dependent Lookups

Lookups can depend on other field values, automatically refetching when dependencies change:

\`\`\`javascript
const lookups = {
  country: {
    fetch: async () => {
      const response = await fetch('/api/countries')
      return response.json()
    },
    fields: { value: 'code', text: 'name' }
  },

  // City options depend on selected country
  city: {
    dependsOn: ['country'],
    fetch: async (deps) => {
      if (!deps.country) return []
      const response = await fetch(\`/api/countries/\${deps.country}/cities\`)
      return response.json()
    },
    fields: { value: 'id', text: 'name' }
  },

  // District depends on both country and city
  district: {
    dependsOn: ['country', 'city'],
    fetch: async (deps) => {
      if (!deps.country || !deps.city) return []
      const response = await fetch(
        \`/api/countries/\${deps.country}/cities/\${deps.city}/districts\`
      )
      return response.json()
    }
  }
}
\`\`\`

### Lookup Configuration

| Property | Type | Description |
|----------|------|-------------|
| \`fetch\` | \`function\` | Async function returning options array |
| \`dependsOn\` | \`string[]\` | Field keys this lookup depends on |
| \`fields\` | \`object\` | Field mapping for options |
| \`cacheKey\` | \`function\` | Custom cache key generator |
| \`ttl\` | \`number\` | Cache time-to-live in ms |

### Lookup State

Access lookup state for UI feedback:

\`\`\`svelte
<script>
  const form = new FormBuilder(data, schema, layout, lookups)

  // Get reactive lookup state
  const countryLookup = form.getLookupState('country')
  // Returns: { options: [], loading: true, error: null }
</script>

{#if countryLookup.loading}
  <p>Loading countries...</p>
{:else if countryLookup.error}
  <p class="error">{countryLookup.error}</p>
{:else}
  <Select options={countryLookup.options} />
{/if}
\`\`\`

### Using createLookup Directly

For standalone lookup management outside FormBuilder:

\`\`\`javascript
import { createLookup, createLookupManager } from '@rokkit/forms'

// Single lookup
const countryLookup = createLookup({
  fetch: async () => {
    const res = await fetch('/api/countries')
    return res.json()
  },
  fields: { value: 'code', text: 'name' }
})

// Access state
countryLookup.options    // Current options array
countryLookup.loading    // Loading state
countryLookup.error      // Error message if failed

// Fetch data
await countryLookup.fetch()

// Cache management
countryLookup.clearCache()
countryLookup.reset()
\`\`\`

### Lookup Manager

For managing multiple related lookups:

\`\`\`javascript
import { createLookupManager } from '@rokkit/forms'

const manager = createLookupManager({
  country: {
    fetch: async () => fetchCountries()
  },
  city: {
    dependsOn: ['country'],
    fetch: async (deps) => fetchCities(deps.country)
  }
})

// Get specific lookup
const cityLookup = manager.getLookup('city')

// Check if lookup exists
manager.hasLookup('country')  // true

// Handle field changes (triggers dependent lookups)
manager.handleFieldChange('country', 'US')

// Initialize all lookups
await manager.initialize()

// Clear all caches
manager.clearAllCaches()
\`\`\`

### Complete Lookup Example

\`\`\`svelte
<script>
  import { Form } from '@rokkit/ui'
  import { FormBuilder } from '@rokkit/forms'

  const schema = {
    type: 'object',
    properties: {
      country: { type: 'enum', required: true },
      city: { type: 'enum', required: true },
      address: { type: 'string' }
    }
  }

  const layout = {
    type: 'vertical',
    elements: [
      { scope: '#/country', label: 'Country' },
      { scope: '#/city', label: 'City' },
      { scope: '#/address', label: 'Address' }
    ]
  }

  const lookups = {
    country: {
      fetch: async () => {
        const res = await fetch('/api/countries')
        return res.json()
      },
      fields: { value: 'code', text: 'name' }
    },
    city: {
      dependsOn: ['country'],
      fetch: async (deps) => {
        if (!deps.country) return []
        const res = await fetch(\`/api/countries/\${deps.country}/cities\`)
        return res.json()
      },
      fields: { value: 'id', text: 'name' }
    }
  }

  let value = $state({ country: '', city: '', address: '' })
  const form = new FormBuilder(value, schema, layout, lookups)

  // Initialize lookups on mount
  $effect(() => {
    form.initializeLookups()
  })
</script>

<Form bind:value {schema} {layout} />
\`\`\`

## FormRenderer Component

For custom rendering with snippets:

\`\`\`svelte
<script>
  import { FormRenderer } from '@rokkit/forms'
  import { FormBuilder } from '@rokkit/forms'

  const form = new FormBuilder(data, schema, layout)
</script>

<FormRenderer {form}>
  {#snippet defaultInput(element)}
    <label>
      {element.props.label}
      <input type={element.type} bind:value={element.value} {...element.props} />
    </label>
  {/snippet}

  {#snippet child(element)}
    <!-- Custom rendering for specific fields -->
    <MyCustomInput {element} />
  {/snippet}
</FormRenderer>
\`\`\`

## Responsive Behavior

Layouts automatically adapt:
- **Desktop**: Full multi-column layouts
- **Tablet**: Reduced columns
- **Mobile**: Single-column stack

## Accessibility

- Logical tab order maintained
- Screen reader friendly structure
- ARIA attributes for errors
- Keyboard navigation support
- High contrast error styling

## API Reference

### Form Props

| Prop | Type | Description |
|------|------|-------------|
| \`value\` | \`object\` | Form data (use \`bind:value\`) |
| \`schema\` | \`array\\|object\` | Field definitions |
| \`layout\` | \`object\` | Layout structure |

### FormBuilder Constructor

| Parameter | Type | Description |
|-----------|------|-------------|
| \`data\` | \`object\` | Initial form data |
| \`schema\` | \`array\\|object\` | Optional schema override |
| \`layout\` | \`object\` | Optional layout override |

## Import

\`\`\`javascript
// High-level Form component
import { Form } from '@rokkit/ui'

// Low-level building blocks
import { FormBuilder, FormRenderer } from '@rokkit/forms'
import { InputField, Input } from '@rokkit/forms'

// Lookup utilities
import { createLookup, createLookupManager } from '@rokkit/forms'
\`\`\`
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
