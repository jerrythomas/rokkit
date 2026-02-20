# @rokkit/forms

> Schema-driven form builder and renderer with 18+ input types, validation, and dynamic lookups.

## Position in Dependency Hierarchy
**Depends on**: @rokkit/core, @rokkit/states, @rokkit/ui, @rokkit/composables, @rokkit/data, valibot, ramda
**Depended on by**: application forms

## Exports

### Core

| Export | Type | Description |
|--------|------|-------------|
| `FormBuilder` | Class | Svelte 5 reactive class: data + schema + layout → form elements |
| `FormRenderer` | Component | Renders form from FormBuilder instance |
| `InputField` | Component | Wraps input with label, description, validation message |
| `InfoField` | Component | Read-only formatted field display |
| `Input` | Component | Generic input routing to type-specific components |

### Schema Utilities

| Export | Signature | Description |
|--------|-----------|-------------|
| `deriveSchemaFromValue(data)` | Auto-generates JSON Schema from data object |
| `deriveLayoutFromValue(data)` | Auto-generates layout configuration from data |
| `getSchemaWithLayout(schema, layout)` | Merges schema and layout configurations |
| `findAttributeByPath(path, schema)` | Finds schema attribute by JSON Pointer |

### Lookup

| Export | Signature | Description |
|--------|-----------|-------------|
| `createLookup(config)` | Creates async lookup for dropdown data loading |
| `createLookupManager()` | Centralized manager for multiple lookups with caching |
| `clearLookupCache()` | Clears cached lookup data |

### Input Components (18 types)

`InputText`, `InputPassword`, `InputEmail`, `InputNumber`, `InputRange`, `InputTel`, `InputUrl`, `InputDate`, `InputDateTime`, `InputMonth`, `InputTime`, `InputWeek`, `InputColor`, `InputFile`, `InputCheckbox`, `InputRadio`, `InputSelect`, `InputTextArea`

## FormBuilder

```javascript
const form = new FormBuilder(data, schema, layout)

form.data           // Current form data (get/set)
form.schema         // JSON Schema (get/set)
form.layout         // Layout config (get/set)
form.elements       // Derived FormElement[] (reactive)
form.combined       // Merged schema + layout
form.validateField(path, value)  // Validate single field
form.validateAll()               // Validate entire form
form.setLookupConfigs(configs)   // Configure async lookups
```

### FormElement structure
```typescript
{
  scope: '#/email',           // JSON Pointer path
  type: 'email',              // Input type
  value: any,                 // Current value from data
  override: boolean,          // Use custom snippet
  props: { label, description, placeholder, required, disabled, min, max, pattern, message }
}
```

## Key Patterns

### Auto-Generate Form

```svelte
<script>
  import { FormRenderer } from '@rokkit/forms'
  let data = { name: '', email: '', age: 25 }
</script>
<FormRenderer bind:data={data} />
```

### Schema + Layout

```javascript
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
    { scope: '#/country', label: 'Country', type: 'select' },
    { type: 'separator' }
  ]
}
```

### Dynamic Lookups

```javascript
form.setLookupConfigs({
  countries: {
    fetch: async () => (await fetch('/api/countries')).json(),
    cache: true
  }
})
```
