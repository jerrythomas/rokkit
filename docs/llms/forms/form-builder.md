# FormBuilder + FormRenderer

> `FormBuilder` is a Svelte 5 reactive class that derives form elements from data + schema + layout. `FormRenderer` renders those elements.

**Package**: `@rokkit/forms`

## FormBuilder

```javascript
import { FormBuilder } from '@rokkit/forms'

const form = new FormBuilder(data, schema, layout, lookups)
// schema, layout, and lookups are all optional
```

### Properties

```javascript
form.data           // Current form data object (get/set — reactive)
form.schema         // JSON Schema (get/set)
form.layout         // Layout config (get/set)
form.validation     // Validation messages keyed by field path (get/set)
form.elements       // Derived FormElement[] (reactive, read-only)
form.combined       // Merged schema + layout (derived)
form.isValid        // true if no error-state validation messages
form.isDirty        // true if data differs from initial snapshot
form.errors         // Array of { path, state, text } for error-state messages
form.messages       // All validation messages ordered by severity
form.dirtyFields    // Set of field paths that differ from initial snapshot
```

### Methods

```javascript
// Field access
form.getValue(path)                    // Get field value by path ('name', 'address/city')
form.updateField(path, value)          // Update field; triggers dependent lookup re-fetch + clears dependent values

// Validation
form.validateField(path)               // Validate single field, returns ValidationMessage | null
form.validate()                        // Validate all fields, populates form.validation
form.setFieldValidation(path, message) // Set validation message manually
form.clearValidation()                 // Clear all validation messages

// Dirty tracking
form.isFieldDirty(path)                // true if field differs from initial value
form.snapshot()                        // Reset dirty baseline to current data

// Lookups
form.initializeLookups()               // Fetch initial options for all configured lookups
form.getLookupState(path)              // Returns { options, loading, error, disabled, fields } | null
form.isFieldDisabled(path)             // true if field is disabled due to unmet lookup dependencies
form.refreshLookup(path)               // Manually re-fetch a field's lookup options
form.setLookups(configs)               // Replace lookup configuration at runtime

// Form
form.reset()                           // Reset data to initial snapshot and clear validation
```

### FormElement structure

```typescript
interface FormElement {
  scope: string         // JSON Pointer path e.g. '#/email'
  type: string          // Input type: 'text', 'email', 'select', 'checkbox', 'range', 'array', etc.
  value: unknown        // Current value from form.data
  override: boolean     // True if layout element sets override: true (use child snippet)
  props: {
    label?: string
    description?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean   // true when lookup dependencies are not met
    loading?: boolean    // true while lookup is fetching
    options?: unknown[]  // Injected by lookup or schema enum
    fields?: object      // Field mapping from lookup config
    min?: number
    max?: number
    message?: { state: string, text: string } | null
    dirty?: boolean
  }
}
```

## FormRenderer

```svelte
<FormRenderer bind:data {schema} {layout} {lookups} onsubmit={handleSubmit} />
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `Record<string, unknown>` | Form data (bindable) |
| `schema` | `object` | JSON Schema (optional — auto-derived from data if omitted) |
| `layout` | `object` | Layout config (optional — auto-derived if omitted) |
| `lookups` | `object` | Lookup configurations keyed by field path |
| `builder` | `FormBuilder` | Pre-constructed FormBuilder (alternative to data/schema/layout) |
| `validateOn` | `'blur' \| 'change' \| 'manual'` | When to run built-in validation (default: `'blur'`) |
| `renderers` | `object` | Custom type renderers merged with defaults |
| `onupdate` | `(data) => void` | Called on every field change |
| `onvalidate` | `(path, value, trigger) => ValidationMessage \| void` | External validation hook |
| `onsubmit` | `(data, { isValid, errors }) => Promise<void>` | Called on valid form submit |
| `actions` | snippet | Custom actions area (receives `{ submitting, isValid, isDirty, submit, reset }`) |
| `child` | snippet | Override rendering for fields with `override: true` in layout (receives `element`) |

## Examples

### Minimal — auto-generate everything

```svelte
<script>
  import { FormRenderer } from '@rokkit/forms'
  let data = $state({ name: '', email: '', age: 25, active: true })
</script>

<FormRenderer bind:data />
```

### With explicit schema and submit

```svelte
<script>
  import { FormRenderer } from '@rokkit/forms'

  let data = $state({ name: '', country: 'US' })
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1 },
      country: { type: 'string', enum: ['US', 'UK', 'CA'] }
    },
    required: ['name']
  }
  const layout = {
    elements: [
      { scope: '#/name', label: 'Full Name', placeholder: 'John Doe' },
      { scope: '#/country', label: 'Country' }
    ]
  }
</script>

<FormRenderer bind:data {schema} {layout} onsubmit={async (d) => save(d)} />
```

### Using FormBuilder directly

```svelte
<script>
  import { FormBuilder, FormRenderer } from '@rokkit/forms'

  let data = $state({ name: '', role: 'user' })
  const schema = { type: 'object', properties: { name: { type: 'string' } } }
  const layout = { elements: [{ scope: '#/name', label: 'Name' }] }

  const form = new FormBuilder(data, schema, layout)
</script>

<FormRenderer builder={form} bind:data />
```

### Override a specific field

Set `override: true` in the layout element, then supply a `child` snippet:

```svelte
<script>
  const layout = {
    elements: [
      { scope: '#/name', label: 'Name' },
      { scope: '#/avatar', label: 'Avatar', override: true }
    ]
  }
</script>

<FormRenderer bind:data {schema} {layout}>
  {#snippet child(element)}
    {#if element.scope === '#/avatar'}
      <ImageUploader bind:value={data.avatar} />
    {/if}
  {/snippet}
</FormRenderer>
```

### Dynamic lookups — URL template

```svelte
<script>
  const lookups = {
    countries: {
      url: '/api/countries',
      fields: { text: 'name', value: 'code' }
    },
    cities: {
      url: '/api/cities?country={country}',
      dependsOn: ['country'],           // city is disabled until country is set
      fields: { text: 'name', value: 'id' }
    }
  }
</script>

<FormRenderer bind:data {schema} {layout} {lookups} />
```

### Dynamic lookups — client-side filter (no network)

```svelte
<script>
  const allCities = [
    { name: 'New York', country: 'USA' },
    { name: 'Paris', country: 'France' }
  ]

  const lookups = {
    city: {
      source: allCities,
      filter: (items, formData) => items.filter(c => c.country === formData.country),
      dependsOn: ['country'],
      fields: { text: 'name', value: 'name' }
    }
  }
</script>

<FormRenderer bind:data {schema} {layout} {lookups} />
```
