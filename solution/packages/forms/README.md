# @rokkit/forms

Schema-driven form rendering for Svelte 5. Generate dynamic forms from data, schema, and layout definitions.

## Installation

```bash
bun add @rokkit/forms
```

## Core Concepts

### FormBuilder

Takes `(data, schema, layout)` and produces a reactive `elements[]` array. Each element describes a form field with its type, current value, and merged properties.

```js
import { FormBuilder } from '@rokkit/forms'

const builder = new FormBuilder(
  { name: 'Alice', age: 30 },     // data
  schema,                           // optional — auto-derived from data
  layout                            // optional — auto-derived from data
)

// builder.elements → [{ scope, type, value, props }, ...]
```

If `schema` is `null`, it is auto-derived from the data using `deriveSchemaFromValue()`. If `layout` is `null`, it is auto-derived using `deriveLayoutFromValue()`.

### Schema

JSON-Schema-like type definitions. Supports: `string`, `number`, `integer`, `boolean`, `array`, `object`, `date`.

```js
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    size: { type: 'string', enum: ['sm', 'md', 'lg'] },
    count: { type: 'integer', min: 0, max: 100 },
    active: { type: 'boolean' }
  }
}
```

### Layout

Controls rendering order, grouping, labels, and component-specific props. Uses JSON Pointer scopes (`#/fieldName`).

```js
const layout = {
  type: 'vertical',
  elements: [
    { scope: '#/name', label: 'Full Name', props: { placeholder: 'Enter name' } },
    { scope: '#/size', label: 'Size', props: { options: ['sm', 'md', 'lg'] } },
    { scope: '#/count', label: 'Count' },
    { type: 'separator' },
    { scope: '#/active', label: 'Active' },
    { scope: '#/total', label: 'Total', readonly: true }
  ]
}
```

### Type Resolution

The FormBuilder determines input type from the schema:

| Schema type | Condition | Input type |
|---|---|---|
| `string` | has `enum` or `options` | `select` |
| `string` | default | `text` |
| `boolean` | — | `checkbox` |
| `number`/`integer` | has `min` and `max` | `range` |
| `number`/`integer` | default | `number` |
| any | `readonly: true` | `info` |
| — | no `scope` | `separator` |

### Layout Props

The `props` field in layout elements passes component-specific configuration:

```js
// Select with string options
{ scope: '#/size', props: { options: ['sm', 'md', 'lg'] } }

// Select with object options and field mapping
{ scope: '#/color', props: {
  options: [{ name: 'Red', hex: '#f00' }, { name: 'Blue', hex: '#00f' }],
  fields: { text: 'name', value: 'hex' }
}}

// Readonly info display
{ scope: '#/total', readonly: true }

// Separator (no scope)
{ type: 'separator' }
```

## Components

### FormRenderer

Renders a complete form from data + schema + layout:

```svelte
<script>
  import { FormRenderer } from '@rokkit/forms'

  let data = $state({ name: '', size: 'md', active: true })
</script>

<FormRenderer bind:data {schema} {layout} />
```

**Props:**
- `data` (bindable) — form data object
- `schema` — JSON schema (optional, auto-derived)
- `layout` — layout definition (optional, auto-derived)
- `onupdate` — callback when data changes
- `onvalidate` — callback for field validation
- `child` — snippet for custom field rendering (receives `element`)

**Custom field rendering:**

```svelte
<FormRenderer bind:data {schema} {layout}>
  {#snippet child(element)}
    <MyCustomInput value={element.value} {...element.props} />
  {/snippet}
</FormRenderer>
```

Set `override: true` on layout elements to route them to the `child` snippet.

### InputField

Wraps an input with label, description, and validation message:

```svelte
<InputField name="email" type="email" value={email} label="Email" onchange={handleChange} />
```

### Input

Type dispatcher — renders the appropriate input component based on `type`:

- `text`, `email`, `password`, `url`, `tel` — text inputs
- `number` — numeric input
- `range` — slider
- `checkbox` — checkbox
- `select` — dropdown (uses `@rokkit/ui` Select)
- `date`, `time`, `datetime-local`, `month`, `week` — date/time inputs
- `color` — color picker
- `file` — file upload
- `textarea` — multiline text
- `radio` — radio group

### InfoField

Read-only display of a label and value:

```svelte
<InfoField label="Total" value={42} />
```

## Lib Utilities

```js
import { getSchemaWithLayout, findAttributeByPath } from '@rokkit/forms'
import { deriveSchemaFromValue } from '@rokkit/forms/lib'
import { deriveLayoutFromValue } from '@rokkit/forms/lib'
```

- `deriveSchemaFromValue(data)` — infer schema from a data object
- `deriveLayoutFromValue(data)` — generate default vertical layout from data
- `getSchemaWithLayout(schema, layout)` — merge schema attributes with layout elements
- `findAttributeByPath(scope, schema)` — find schema attribute by JSON Pointer path

## Theming

Form field styles are provided by `@rokkit/themes`. The components use data-attribute selectors:

| Selector | Purpose |
|---|---|
| `[data-form-root]` | Form container |
| `[data-form-field]` | Field wrapper |
| `[data-form-separator]` | Separator between fields |
| `[data-field-root]` | Input field root |
| `[data-field]` | Field inner wrapper |
| `[data-field-type="..."]` | Type-specific layout (checkbox, info, select) |
| `[data-field-info]` | Info/readonly value display |
| `[data-input-root]` | Input element wrapper |
| `[data-description]` | Help text |
| `[data-message]` | Validation message |

## Future Enhancements

### Toggle/Switch as Checkbox Alternative

Use `@rokkit/ui` Toggle or Switch components as alternatives to the native checkbox for boolean fields. The layout could specify the preferred component:

```js
{ scope: '#/active', label: 'Active', props: { component: 'switch' } }
```

### Toggle as Select Alternative

For fields with a small number of options, a Toggle (radio-style button group) can replace Select for better UX:

```js
{ scope: '#/size', label: 'Size', props: { component: 'toggle', options: ['sm', 'md', 'lg'] } }
```

**Constraints:**
- **Text options**: max 3 options (beyond 3, text labels overflow in compact layouts)
- **Icon-only options**: max 5 options (icons are more compact)
- When the option count exceeds these limits, fall back to Select automatically

### MultiSelect for Array Values

When the value is an array and `options` is present in the layout, render a MultiSelect component instead of a single-value Select:

```js
// Schema: tags is an array
{ tags: { type: 'array', items: { type: 'string' } } }

// Layout: options provided → MultiSelect
{ scope: '#/tags', label: 'Tags', props: { options: ['bug', 'feature', 'docs'] } }
```

### Connected/Dependent Props

Support cascading dependencies between fields — changing one field's value updates another field's options. For example, selecting a country updates the available cities:

```js
const lookups = {
  city: {
    dependsOn: 'country',
    fetch: async (country) => getCitiesForCountry(country)
  }
}

const builder = new FormBuilder(data, schema, layout, lookups)
await builder.initializeLookups()
```

The `FormBuilder` already has `lookupManager` infrastructure for this pattern. The remaining work is:
- Auto-wiring lookup state (options, loading) into element props
- UI indicators for loading state on dependent fields
- Debouncing rapid changes to parent fields
