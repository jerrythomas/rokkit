# Input Types

> The 18+ input components in `@rokkit/forms`, each wrapping a specific HTML input or UI component.

**Package**: `@rokkit/forms`
**All wrapped in**: `InputField` (provides label, description, validation message)

## Text Inputs

| Component | Type attr | Description |
|-----------|-----------|-------------|
| `InputText` | `text` | Single-line text |
| `InputPassword` | `password` | Password with show/hide toggle |
| `InputEmail` | `email` | Email with browser validation |
| `InputTel` | `tel` | Phone number |
| `InputUrl` | `url` | URL |
| `InputTextArea` | — | Multi-line text |

## Numeric Inputs

| Component | Type attr | Description |
|-----------|-----------|-------------|
| `InputNumber` | `number` | Numeric input with min/max/step |
| `InputRange` | `range` | Range slider (wraps `Range` from `@rokkit/ui`) |

## Date/Time Inputs

| Component | Type attr | Description |
|-----------|-----------|-------------|
| `InputDate` | `date` | Date picker |
| `InputDateTime` | `datetime-local` | Date + time picker |
| `InputTime` | `time` | Time picker |
| `InputMonth` | `month` | Month picker |
| `InputWeek` | `week` | Week picker |

## Selection Inputs

| Component | Description |
|-----------|-------------|
| `InputSelect` | Dropdown select (wraps `Select` from `@rokkit/ui`) |
| `InputRadio` | Radio button group |
| `InputCheckbox` | Single checkbox |
| `InputToggle` | Toggle button group (wraps `Toggle` from `@rokkit/ui`) |
| `InputSwitch` | iOS-style binary switch (wraps `Switch` from `@rokkit/ui`) |

## File/Media Inputs

| Component | Type attr | Description |
|-----------|-----------|-------------|
| `InputColor` | `color` | Color picker |
| `InputFile` | `file` | File upload |

## Common Props (all inputs)

| Prop | Description |
|------|-------------|
| `value` | Current value (bindable) |
| `label` | Field label |
| `description` | Help text below field |
| `placeholder` | Input placeholder |
| `required` | Required indicator |
| `disabled` | Disables input |
| `message` | Validation error message |

## Usage in Schema

In `FormRenderer`, input type is derived from JSON Schema `type` and additional hints:

| Schema | Inferred type |
|--------|---------------|
| `{ type: 'string' }` | `InputText` |
| `{ type: 'string', format: 'email' }` | `InputEmail` |
| `{ type: 'string', format: 'date' }` | `InputDate` |
| `{ type: 'string', enum: [...] }` | `InputSelect` |
| `{ type: 'number' }` | `InputNumber` |
| `{ type: 'boolean' }` | `InputSwitch` |
| `{ type: 'array' }` with options | `InputSelect` (multi) |
| Layout `type: 'select'` override | `InputSelect` |
| Layout `type: 'radio'` override | `InputRadio` |
| Layout `type: 'toggle'` override | `InputToggle` |
| Layout `type: 'textarea'` override | `InputTextArea` |
| Layout `type: 'separator'` | Visual separator |
| Layout `type: 'info'` | `InfoField` (read-only) |

## Using Inputs Standalone

```svelte
<script>
  import { InputText, InputSelect, InputSwitch } from '@rokkit/forms'
  let name = $state('')
  let role = $state('user')
  let active = $state(true)
</script>

<InputText bind:value={name} label="Name" placeholder="Full name" required />
<InputSelect
  bind:value={role}
  label="Role"
  options={['admin', 'user', 'viewer']}
/>
<InputSwitch bind:value={active} label="Active" />
```
