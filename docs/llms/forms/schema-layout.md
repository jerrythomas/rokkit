# Schema + Layout

> How `@rokkit/forms` uses JSON Schema and layout configuration to drive form rendering.

**Package**: `@rokkit/forms`

## JSON Schema

Standard JSON Schema (draft-07 compatible). The `FormBuilder` reads it to derive field types, validation rules, and options.

```javascript
const schema = {
  type: 'object',
  properties: {
    name:    { type: 'string', minLength: 1 },
    age:     { type: 'number', minimum: 18 },
    email:   { type: 'string', format: 'email' },
    role:    { type: 'string', enum: ['admin', 'user', 'viewer'] },
    active:  { type: 'boolean' },
    tags:    { type: 'array', items: { type: 'string' } }
  },
  required: ['name', 'email']
}
```

## Layout Config

Describes field order, labels, overrides, and display hints. Elements reference schema properties via JSON Pointer `scope`.

```javascript
const layout = {
  elements: [
    // Reference a schema property
    { scope: '#/name', label: 'Full Name', placeholder: 'John Doe' },

    // Override inferred type
    { scope: '#/role', label: 'Role', type: 'radio' },

    // Separator
    { type: 'separator' },

    // Read-only display
    { scope: '#/email', type: 'info', label: 'Email (read-only)' },

    // Custom field description
    { scope: '#/active', label: 'Account active', description: 'Disabling prevents login' }
  ]
}
```

## Auto-Derivation

If schema or layout are omitted, `FormBuilder` auto-derives them:

```javascript
// Auto-derive schema from data
const schema = deriveSchemaFromValue({ name: '', age: 25, active: true })
// → { type: 'object', properties: { name: { type: 'string' }, age: { type: 'number' }, active: { type: 'boolean' } } }

// Auto-derive layout from data (field order follows key order)
const layout = deriveLayoutFromValue({ name: '', age: 25 })
// → { elements: [{ scope: '#/name' }, { scope: '#/age' }] }
```

## Field Path Utilities

```javascript
import { findAttributeByPath, getSchemaWithLayout } from '@rokkit/forms'

// Find schema attribute by JSON Pointer
const nameSchema = findAttributeByPath('#/name', schema)  // → { type: 'string', minLength: 1 }

// Merge schema + layout into combined form descriptor
const combined = getSchemaWithLayout(schema, layout)
```

## Validation

FormBuilder uses **valibot** for field validation based on schema rules:

```javascript
// Validate single field
const error = form.validateField('#/email', 'invalid-email')
// → 'Must be a valid email address' | null

// Validate all
const { valid, errors } = form.validateAll()
// errors: { '#/name': 'Required', '#/email': 'Invalid format' }
```

Validation messages can be customized per field via layout `message` property.

## Lookup Configuration

Pass a `lookups` object to `FormRenderer` (or the `FormBuilder` constructor) to wire up dynamic options for select fields. The key is the **plain field path** (no `#/` prefix).

Three patterns are supported:

### URL template

```javascript
const lookups = {
  countries: {
    url: '/api/countries',
    fields: { text: 'name', value: 'code' }
  },
  // Re-fetches when 'country' changes; field is disabled until dependency is met
  cities: {
    url: '/api/cities?country={country}',
    dependsOn: ['country'],
    fields: { text: 'name', value: 'id' }
  }
}
```

### Async fetch hook

```javascript
const lookups = {
  countries: {
    fetch: async (formData) => (await fetch('/api/countries')).json(),
    fields: { text: 'name', value: 'code' }
  },
  // With optional result caching keyed by a custom function
  cities: {
    fetch: async (formData) => (await fetch(`/api/cities?c=${formData.country}`)).json(),
    dependsOn: ['country'],
    cacheKey: (formData) => formData.country   // omit to disable caching
  }
}
```

### Client-side filter (synchronous)

```javascript
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
```

### Common options

| Option | Type | Description |
|--------|------|-------------|
| `dependsOn` | `string[]` | Field paths this lookup depends on. Field is **disabled** until all deps have values; dependent field values are **cleared** when a dep changes. |
| `fields` | `object` | Field mapping for the response data (`text`, `value`, etc.) |
| `transform` | `(data) => any[]` | Transform response before use |
| `cacheTime` | `number` | Cache TTL in ms (default: 5 min). URL lookups cache by resolved URL; fetch hooks cache by `cacheKey`. |

### Using with FormRenderer

```svelte
<FormRenderer bind:data {schema} {layout} {lookups} />
```

Lookups initialize on mount. When a dependency field changes, the dependent field value clears and the options re-fetch automatically.
