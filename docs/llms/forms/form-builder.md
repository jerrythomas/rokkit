# FormBuilder + FormRenderer

> `FormBuilder` is a Svelte 5 reactive class that derives form elements from data + schema + layout. `FormRenderer` renders those elements.

**Package**: `@rokkit/forms`

## FormBuilder

```javascript
import { FormBuilder } from '@rokkit/forms'

const form = new FormBuilder(data, schema, layout)
```

### Properties

```javascript
form.data           // Current form data object (get/set — reactive)
form.schema         // JSON Schema (get/set)
form.layout         // Layout config (get/set)
form.elements       // Derived FormElement[] (reactive, read-only)
form.combined       // Merged schema + layout (derived)
```

### Methods

```javascript
form.validateField(path, value)       // Validate single field, returns error string | null
form.validateAll()                    // Validate all fields, returns { valid, errors }
form.setLookupConfigs(configs)        // Configure async lookups for select/multiselect inputs
```

### FormElement structure

```typescript
interface FormElement {
  scope: string         // JSON Pointer path e.g. '#/email'
  type: string          // Input type: 'text', 'email', 'select', 'checkbox', etc.
  value: unknown        // Current value from form.data
  override: boolean     // True if a named snippet should override rendering
  props: {
    label: string
    description?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    min?: number | string
    max?: number | string
    pattern?: string
    message?: string      // Validation error message
    options?: unknown[]   // For select/radio inputs
  }
}
```

## FormRenderer

```svelte
<FormRenderer bind:data {schema} {layout} {form} onsubmit={handleSubmit} />
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `Record<string, unknown>` | Form data (bindable) |
| `schema` | `object` | JSON Schema (optional — auto-derived from data if omitted) |
| `layout` | `object` | Layout config (optional — auto-derived if omitted) |
| `form` | `FormBuilder` | Pre-constructed FormBuilder (alternative to data/schema/layout) |
| `onsubmit` | `(data) => void` | Called on form submit |

### Snippets

| Snippet | Signature | Description |
|---------|-----------|-------------|
| `[scope]` | `(element, form)` | Override rendering for a specific field by scope path |
| `footer` | `(form)` | Custom form footer (submit/cancel buttons) |

## Examples

### Minimal — auto-generate everything

```svelte
<script>
  import { FormRenderer } from '@rokkit/forms'
  let data = $state({ name: '', email: '', age: 25, active: true })
</script>

<FormRenderer bind:data />
```

### With explicit schema

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
      { scope: '#/country', label: 'Country', type: 'select' }
    ]
  }
</script>

<FormRenderer bind:data {schema} {layout} onsubmit={(d) => save(d)} />
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

<FormRenderer {form} bind:data />
```

### Override a specific field

```svelte
<FormRenderer bind:data {schema} {layout}>
  {#snippet ['#/avatar'](element, form)}
    <ImageUploader bind:value={data.avatar} />
  {/snippet}
</FormRenderer>
```

### Dynamic lookups

```javascript
form.setLookupConfigs({
  countries: {
    fetch: async () => (await fetch('/api/countries')).json(),
    cache: true
  },
  cities: {
    fetch: async (query) => (await fetch(`/api/cities?q=${query}`)).json(),
    dependsOn: '#/country'
  }
})
```
