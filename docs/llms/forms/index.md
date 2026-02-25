# @rokkit/forms — Overview

> Schema-driven form builder and renderer with 18+ input types, validation, dynamic lookups, and display components.

**Package**: `@rokkit/forms`
**Depends on**: `@rokkit/core`, `@rokkit/states`, `@rokkit/ui`, `valibot`, `ramda`

## Files in This Section

| Topic | File |
|-------|------|
| FormBuilder + FormRenderer | [form-builder.md](form-builder.md) |
| Input types (18+) | [input-types.md](input-types.md) |
| Schema + Layout | [schema-layout.md](schema-layout.md) |

## Exports Summary

### Core Components

| Export | Type | Description |
|--------|------|-------------|
| `FormRenderer` | Component | Renders form from FormBuilder instance |
| `InputField` | Component | Wraps input with label, description, validation |
| `InfoField` | Component | Read-only formatted field display |
| `Input` | Component | Generic input router to type-specific components |
| `FieldLayout` | Component | Form layout with field groups |

### Classes + Utilities

| Export | Description |
|--------|-------------|
| `FormBuilder` | Svelte 5 reactive class: data + schema + layout → form elements |
| `deriveSchemaFromValue(data)` | Auto-generate JSON Schema from a data object |
| `deriveLayoutFromValue(data)` | Auto-generate layout from a data object |
| `getSchemaWithLayout(schema, layout)` | Merge schema and layout |
| `findAttributeByPath(path, schema)` | Find schema attribute by JSON Pointer |
| `createLookup(config)` | Create async lookup for dropdown loading |
| `createLookupManager()` | Centralized lookup cache manager |

### Input Components (18 types)

`InputText`, `InputPassword`, `InputEmail`, `InputNumber`, `InputRange`, `InputTel`, `InputUrl`, `InputDate`, `InputDateTime`, `InputMonth`, `InputTime`, `InputWeek`, `InputColor`, `InputFile`, `InputCheckbox`, `InputRadio`, `InputSelect`, `InputSwitch`, `InputTextArea`, `InputToggle`

### Display Components

`DisplayValue`, `DisplayList`, `DisplayTable`, `DisplayCardGrid`, `DisplaySection`

## Quick Start

```svelte
<script>
  import { FormRenderer } from '@rokkit/forms'
  let data = $state({ name: '', email: '', age: 25 })
</script>

<!-- Auto-generate form from data shape -->
<FormRenderer bind:data />
```
