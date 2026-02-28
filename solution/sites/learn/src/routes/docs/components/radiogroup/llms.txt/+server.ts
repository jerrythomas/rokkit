import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit RadioGroup Component

> Data-driven radio button group for single selection from multiple options.

The RadioGroup component renders a vertical list of radio buttons that adapts to any data structure through field mapping. It uses native HTML radio inputs for accessibility and standard keyboard behavior.

## Quick Start

\`\`\`svelte
<script>
  import { RadioGroup } from '@rokkit/ui'

  let options = ['Small', 'Medium', 'Large']
  let value = $state('Medium')
</script>

<RadioGroup {options} bind:value name="size" />
\`\`\`

## Core Concepts

### Data-Driven Design

RadioGroup adapts to your data structure through field mapping:

\`\`\`svelte
<script>
  import { RadioGroup } from '@rokkit/ui'
  import { FieldMapper } from '@rokkit/core'

  const plans = [
    { id: 'basic', name: 'Basic Plan', price: 9 },
    { id: 'pro', name: 'Pro Plan', price: 29 },
    { id: 'enterprise', name: 'Enterprise', price: 99 }
  ]

  const mapping = new FieldMapper({ text: 'name', value: 'id' })
  let selected = $state('basic')
</script>

<RadioGroup options={plans} {mapping} bind:value={selected} name="plan" />
\`\`\`

### Field Mapper

The component uses FieldMapper from \`@rokkit/core\` to extract values:

\`\`\`javascript
import { FieldMapper } from '@rokkit/core'

// Create custom mapping
const mapping = new FieldMapper({
  text: 'label',    // Field for display text
  value: 'id'       // Field for radio value
})

// Usage
mapping.get('text', item)   // Get display text
mapping.get('value', item)  // Get value
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`options\` | \`array\` | \`[]\` | Array of radio options |
| \`value\` | \`any\` | — | Selected value (use \`bind:value\`) |
| \`name\` | \`string\` | — | HTML name attribute (required for form submission) |
| \`mapping\` | \`FieldMapper\` | \`defaultMapping\` | Field mapper for data extraction |
| \`readOnly\` | \`boolean\` | \`false\` | Disable all radio buttons |
| \`textAfter\` | \`boolean\` | \`true\` | Text position (after or before icon) |
| \`stateIcons\` | \`object\` | \`defaultStateIcons.radio\` | Custom on/off icons |
| \`id\` | \`string\` | \`null\` | HTML id attribute |
| \`class\` | \`string\` | \`''\` | CSS class names |

## Field Mapping

Map your data fields using FieldMapper:

| Field | Default | Description |
|-------|---------|-------------|
| \`text\` | \`'text'\` | Display label text |
| \`value\` | \`'value'\` | Radio button value |

### Mapping Examples

\`\`\`svelte
<script>
  import { FieldMapper } from '@rokkit/core'

  // Simple string array - no mapping needed
  const sizes = ['S', 'M', 'L', 'XL']

  // Object array with custom fields
  const colors = [
    { colorName: 'Red', hex: '#ff0000' },
    { colorName: 'Blue', hex: '#0000ff' }
  ]
  const colorMapping = new FieldMapper({ text: 'colorName', value: 'hex' })
</script>

<RadioGroup options={sizes} bind:value={size} name="size" />
<RadioGroup options={colors} mapping={colorMapping} bind:value={color} name="color" />
\`\`\`

## State Icons

Customize radio button icons:

\`\`\`svelte
<script>
  const customIcons = {
    on: 'check-circle',   // Selected state
    off: 'circle'         // Unselected state
  }
</script>

<RadioGroup {options} bind:value stateIcons={customIcons} name="choice" />
\`\`\`

Default icons from \`defaultStateIcons.radio\`:
- \`on\`: \`'radio-on'\`
- \`off\`: \`'radio-off'\`

## Text Position

Control label position relative to the radio icon:

\`\`\`svelte
<!-- Text after icon (default) -->
<RadioGroup {options} bind:value textAfter={true} name="opt1" />

<!-- Text before icon -->
<RadioGroup {options} bind:value textAfter={false} name="opt2" />
\`\`\`

## Keyboard Navigation

Uses native HTML radio button behavior:

| Key | Action |
|-----|--------|
| \`ArrowUp\` | Previous option |
| \`ArrowDown\` | Next option |
| \`ArrowLeft\` | Previous option |
| \`ArrowRight\` | Next option |
| \`Space\` | Select focused option |
| \`Tab\` | Move focus in/out of group |

## Read-Only Mode

Disable interaction while showing selection:

\`\`\`svelte
<RadioGroup {options} bind:value readOnly={true} name="display" />
\`\`\`

## Accessibility

- Uses native \`<input type="radio">\` elements
- Implicit \`radiogroup\` role from HTML semantics
- Each option wrapped in \`<label>\` for click area
- \`disabled\` attribute when \`readOnly\` is true
- Proper \`name\` attribute for form grouping

## Data Attributes for Styling

| Element | Selector | Description |
|---------|----------|-------------|
| Root | \`rk-radio-group\` | Main container |
| Option | \`label\` | Individual radio option |
| Input | \`input[type="radio"]\` | Hidden radio input |
| Icon | \`icon\` | State indicator icon |
| Text | \`p\` | Label text |

### Styling Example

\`\`\`css
rk-radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

rk-radio-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.15s;
}

rk-radio-group label:hover {
  background-color: var(--surface-100);
}

rk-radio-group label.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

rk-radio-group icon {
  font-size: 1.25rem;
  color: var(--primary);
}

rk-radio-group p {
  margin: 0;
  font-size: 0.875rem;
}
\`\`\`

## Import

\`\`\`javascript
// Named import
import { RadioGroup } from '@rokkit/ui'

// With FieldMapper
import { RadioGroup } from '@rokkit/ui'
import { FieldMapper } from '@rokkit/core'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface RadioGroupProps {
  options?: any[]
  value?: any
  name?: string
  mapping?: FieldMapper
  readOnly?: boolean
  textAfter?: boolean
  stateIcons?: RadioIcons
  id?: string | null
  class?: string
}

interface RadioIcons {
  on: string
  off: string
}
\`\`\`

## Examples

### Simple String Options

\`\`\`svelte
<script>
  import { RadioGroup } from '@rokkit/ui'

  let priority = $state('medium')
</script>

<RadioGroup
  options={['low', 'medium', 'high', 'urgent']}
  bind:value={priority}
  name="priority"
/>
\`\`\`

### Object Options with Mapping

\`\`\`svelte
<script>
  import { RadioGroup } from '@rokkit/ui'
  import { FieldMapper } from '@rokkit/core'

  const shippingOptions = [
    { method: 'standard', label: 'Standard (5-7 days)', cost: 0 },
    { method: 'express', label: 'Express (2-3 days)', cost: 9.99 },
    { method: 'overnight', label: 'Overnight', cost: 24.99 }
  ]

  const mapping = new FieldMapper({ text: 'label', value: 'method' })
  let shipping = $state('standard')
</script>

<RadioGroup
  options={shippingOptions}
  {mapping}
  bind:value={shipping}
  name="shipping"
/>
\`\`\`

### With Custom Icons

\`\`\`svelte
<script>
  let agreement = $state(null)

  const stateIcons = {
    on: 'check-square',
    off: 'square'
  }
</script>

<RadioGroup
  options={['I agree', 'I disagree']}
  bind:value={agreement}
  {stateIcons}
  name="agreement"
/>
\`\`\`

### Form Integration

\`\`\`svelte
<form onsubmit={handleSubmit}>
  <fieldset>
    <legend>Select Size</legend>
    <RadioGroup
      options={['XS', 'S', 'M', 'L', 'XL']}
      bind:value={formData.size}
      name="size"
    />
  </fieldset>
  <button type="submit">Submit</button>
</form>
\`\`\`

### Read-Only Display

\`\`\`svelte
<script>
  // Show user's previous selection (non-editable)
  let savedChoice = 'Option B'
</script>

<RadioGroup
  options={['Option A', 'Option B', 'Option C']}
  value={savedChoice}
  readOnly={true}
  name="display"
/>
\`\`\`

## Related Components

- **Switch** - Horizontal option switcher
- **CheckBox** - Single boolean toggle
- **Select** - Dropdown single selection
- **InputRadio** - Form-integrated radio group (\`@rokkit/forms\`)
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
