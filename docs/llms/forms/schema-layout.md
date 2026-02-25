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

For select inputs that load options asynchronously:

```javascript
form.setLookupConfigs({
  // Static cache
  countries: {
    fetch: async () => (await fetch('/api/countries')).json(),
    fields: { text: 'name', value: 'code' },
    cache: true
  },
  // Dynamic (re-fetches when dependency changes)
  cities: {
    fetch: async (q, formData) => {
      const country = formData.country
      return (await fetch(`/api/cities?country=${country}&q=${q}`)).json()
    },
    dependsOn: '#/country',
    cache: false
  }
})
```

The lookup key matches the field scope: `#/countries` → `countries` config.
