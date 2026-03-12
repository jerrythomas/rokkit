# @rokkit/forms

Schema-driven form builder and renderer for Svelte 5 applications.

## Installation

```bash
npm install @rokkit/forms
# or
bun add @rokkit/forms
```

## Overview

`@rokkit/forms` generates dynamic forms from a data object, a JSON Schema definition, and a layout configuration. Both schema and layout can be auto-derived from data, so you can get a working form with zero configuration. The `FormBuilder` class produces a reactive `elements[]` array; the `FormRenderer` component renders it.

## Usage

### Minimal — auto-derive everything

```svelte
<script>
  import { FormRenderer } from '@rokkit/forms'

  let data = $state({ name: '', age: 0, active: true })
</script>

<FormRenderer bind:data />
```

Schema and layout are inferred from the data shape automatically.

### With explicit schema and layout

```svelte
<script>
  import { FormRenderer } from '@rokkit/forms'

  let data = $state({ name: '', role: 'viewer', count: 5, active: false })

  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      role: { type: 'string', enum: ['viewer', 'editor', 'admin'] },
      count: { type: 'integer', min: 0, max: 100 },
      active: { type: 'boolean' }
    }
  }

  const layout = {
    type: 'vertical',
    elements: [
      { scope: '#/name', label: 'Full Name', props: { placeholder: 'Enter name' } },
      { scope: '#/role', label: 'Role' },
      { scope: '#/count', label: 'Count' },
      { type: 'separator' },
      { scope: '#/active', label: 'Active' }
    ]
  }
</script>

<FormRenderer bind:data {schema} {layout} onupdate={(val) => console.log(val)} />
```

### FormBuilder (imperative)

Use `FormBuilder` directly when you need to drive forms outside of `FormRenderer`:

```js
import { FormBuilder } from '@rokkit/forms'

const form = new FormBuilder(data, schema, layout)

// form.elements → [{ scope, type, value, props }, ...]
form.updateField('#/name', 'Alice')
form.validateField('#/name')
form.validateAll()
form.isDirty('#/name') // true if value differs from initial
```

### Validation

```js
import { validateField, validateAll, patterns } from '@rokkit/forms'

const result = validateField(value, { required: true, pattern: patterns.email })
// result → { state: 'error', text: 'Invalid email address' } | null
```

### Dependent lookups with createLookup

`createLookup` creates a reactive dropdown data source that can depend on other field values:

```js
import { createLookup } from '@rokkit/forms'

// Fetch from a URL template — {region} is replaced by the current field value
const countriesLookup = createLookup({ url: '/api/countries?region={region}' })

// Async fetch function — receives current dependency values
const citiesLookup = createLookup({
  fetch: async (deps) => {
    if (!deps.country) return { disabled: true, options: [] }
    return { options: await getCities(deps.country) }
  }
})

// Client-side filter — no network request
const filteredLookup = createLookup({
  source: allOptions,
  filter: (item, deps) => item.region === deps.region
})
```

### Custom field rendering

Override individual fields with your own components using the `child` snippet and `override: true` in the layout:

```svelte
<script>
  import { FormRenderer } from '@rokkit/forms'

  const layout = {
    type: 'vertical',
    elements: [
      { scope: '#/tags', label: 'Tags', override: true },
      { scope: '#/name', label: 'Name' }
    ]
  }
</script>

<FormRenderer bind:data {schema} {layout}>
  {#snippet child(element)}
    <!-- rendered for elements with override: true -->
    <TagInput value={element.value} onchange={(v) => form.updateField(element.scope, v)} />
  {/snippet}
</FormRenderer>
```

## Type resolution

`FormBuilder` maps schema types to input types automatically:

| Schema type          | Condition                         | Input type  |
| -------------------- | --------------------------------- | ----------- |
| `string`             | has `enum` or `options` in layout | `select`    |
| `string`             | default                           | `text`      |
| `boolean`            | —                                 | `checkbox`  |
| `number` / `integer` | has both `min` and `max`          | `range`     |
| `number` / `integer` | default                           | `number`    |
| any                  | `readonly: true` in layout        | `info`      |
| —                    | no `scope`                        | `separator` |

## Components

| Component          | Description                                                           |
| ------------------ | --------------------------------------------------------------------- |
| `FormRenderer`     | Renders a complete form from data + schema + layout                   |
| `Input`            | Type-dispatching input — renders the right control for a given `type` |
| `InputField`       | Input wrapped with label, description, and validation message         |
| `InfoField`        | Read-only label + value display                                       |
| `ValidationReport` | Displays a list of validation messages                                |

## Utilities

```js
import {
  deriveSchemaFromValue, // infer JSON schema from a data object
  deriveLayoutFromValue, // generate a default vertical layout from data
  getSchemaWithLayout, // merge schema attributes with layout elements
  findAttributeByPath, // look up a schema attribute by JSON Pointer path
  validateField, // validate a single value against schema constraints
  validateAll, // validate all fields in a FormBuilder
  patterns // regex patterns: email, url, phone, etc.
} from '@rokkit/forms'
```

## Theming

Components use `data-*` attribute selectors. Apply styles via `@rokkit/themes` or target these hooks directly:

| Selector                  | Purpose              |
| ------------------------- | -------------------- |
| `[data-form-root]`        | Form container       |
| `[data-form-field]`       | Field wrapper        |
| `[data-form-separator]`   | Separator element    |
| `[data-field-root]`       | Input field root     |
| `[data-field-type="..."]` | Type-specific layout |
| `[data-description]`      | Help text            |
| `[data-message]`          | Validation message   |

---

Part of [Rokkit](https://github.com/jerrythomas/rokkit) — a Svelte 5 component library and design system.
