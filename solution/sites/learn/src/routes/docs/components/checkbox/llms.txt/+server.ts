import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit CheckBox Component

> Accessible checkbox component with customizable state icons.

The CheckBox component provides a boolean toggle with three visual states: checked, unchecked, and unknown. It supports custom icons and read-only mode.

## Quick Start

\`\`\`svelte
<script>
  import { CheckBox } from '@rokkit/ui'

  let accepted = $state(false)
</script>

<CheckBox name="terms" bind:value={accepted} />
<label>I accept the terms and conditions</label>
\`\`\`

## Core Concepts

### Three States

CheckBox supports three visual states:

\`\`\`svelte
<script>
  let checked = $state(true)      // Checked state
  let unchecked = $state(false)   // Unchecked state
  let unknown = $state(null)      // Unknown/indeterminate state
</script>

<CheckBox bind:value={checked} />
<CheckBox bind:value={unchecked} />
<CheckBox bind:value={unknown} />
\`\`\`

### Custom State Icons

Override the default icons for each state:

\`\`\`svelte
<script>
  import { CheckBox } from '@rokkit/ui'

  const customIcons = {
    checked: 'fa-solid fa-square-check',
    unchecked: 'fa-regular fa-square',
    unknown: 'fa-solid fa-square-minus'
  }
</script>

<CheckBox stateIcons={customIcons} bind:value />
\`\`\`

### Read-Only Mode

Prevent user interaction while showing state:

\`\`\`svelte
<CheckBox value={true} readOnly />
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`value\` | \`boolean \\| null\` | \`false\` | Checkbox state (use \`bind:value\`) |
| \`name\` | \`string\` | \`undefined\` | Form input name |
| \`id\` | \`string\` | \`null\` | Element ID |
| \`readOnly\` | \`boolean\` | \`false\` | Prevents interaction |
| \`stateIcons\` | \`object\` | \`defaultStateIcons.checkbox\` | Custom icons per state |
| \`tabindex\` | \`number\` | \`0\` | Tab index |
| \`class\` | \`string\` | \`''\` | CSS class names |

### State Icons Object

\`\`\`javascript
const stateIcons = {
  checked: 'icon-class-for-checked',
  unchecked: 'icon-class-for-unchecked',
  unknown: 'icon-class-for-unknown'
}
\`\`\`

## Component Structure

\`\`\`
<rk-checkbox>
├── <input type="checkbox" hidden>  // Hidden native input
└── <icon class="...">              // Visual icon
</rk-checkbox>
\`\`\`

## Data Attributes for Styling

| Attribute | Element | Purpose |
|-----------|---------|---------|
| \`rk-checkbox\` | Root | Custom element tag |
| \`aria-checked\` | Root | Current state (checked/unchecked/unknown) |
| \`aria-disabled\` | Root | Read-only state |
| \`.disabled\` | Root | Class when readOnly |

### Styling Example

\`\`\`css
rk-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
}

rk-checkbox icon {
  font-size: 1.25rem;
  color: var(--surface-600);
  transition: color 0.15s, transform 0.15s;
}

rk-checkbox[aria-checked="true"] icon {
  color: var(--primary-500);
}

rk-checkbox[aria-checked="mixed"] icon {
  color: var(--warning-500);
}

rk-checkbox:hover icon {
  transform: scale(1.1);
}

rk-checkbox:active icon {
  transform: scale(0.95);
}

rk-checkbox.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

rk-checkbox.disabled:hover icon {
  transform: none;
}
\`\`\`

## Keyboard Navigation

| Key | Action |
|-----|--------|
| \`Enter\` | Toggle checkbox |
| \`Space\` | Toggle checkbox |

## Accessibility

- Uses \`role="checkbox"\` for screen readers
- \`aria-checked\` reflects current state
- \`aria-disabled\` for read-only state
- Hidden native input for form submission
- Full keyboard support

## Import

\`\`\`javascript
// Named import
import { CheckBox } from '@rokkit/ui'

// Default import
import CheckBox from '@rokkit/ui/checkbox'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface CheckBoxProps {
  value?: boolean | null
  name?: string
  id?: string
  readOnly?: boolean
  stateIcons?: {
    checked: string
    unchecked: string
    unknown: string
  }
  tabindex?: number
  class?: string
}
\`\`\`

## Examples

### Basic Checkbox

\`\`\`svelte
<script>
  import { CheckBox } from '@rokkit/ui'

  let isEnabled = $state(false)
</script>

<div class="checkbox-field">
  <CheckBox id="enabled" name="enabled" bind:value={isEnabled} />
  <label for="enabled">Enable notifications</label>
</div>
\`\`\`

### Checkbox Group

\`\`\`svelte
<script>
  import { CheckBox } from '@rokkit/ui'

  let options = $state({
    email: true,
    sms: false,
    push: true
  })
</script>

<fieldset>
  <legend>Notification Preferences</legend>

  <div class="checkbox-field">
    <CheckBox id="email" bind:value={options.email} />
    <label for="email">Email</label>
  </div>

  <div class="checkbox-field">
    <CheckBox id="sms" bind:value={options.sms} />
    <label for="sms">SMS</label>
  </div>

  <div class="checkbox-field">
    <CheckBox id="push" bind:value={options.push} />
    <label for="push">Push notifications</label>
  </div>
</fieldset>
\`\`\`

### Indeterminate State

\`\`\`svelte
<script>
  import { CheckBox } from '@rokkit/ui'

  let items = $state([
    { name: 'Item 1', checked: true },
    { name: 'Item 2', checked: false },
    { name: 'Item 3', checked: true }
  ])

  // Parent is indeterminate when some (not all) children are checked
  let allChecked = $derived.by(() => {
    const checkedCount = items.filter(i => i.checked).length
    if (checkedCount === 0) return false
    if (checkedCount === items.length) return true
    return null // Indeterminate
  })

  function toggleAll() {
    const newValue = allChecked !== true
    items = items.map(i => ({ ...i, checked: newValue }))
  }
</script>

<div class="checkbox-field">
  <CheckBox value={allChecked} onclick={toggleAll} />
  <label>Select All</label>
</div>

{#each items as item, i}
  <div class="checkbox-field indent">
    <CheckBox bind:value={items[i].checked} />
    <label>{item.name}</label>
  </div>
{/each}
\`\`\`

### Custom Icons

\`\`\`svelte
<script>
  import { CheckBox } from '@rokkit/ui'

  let value = $state(false)

  // Heart-style checkbox
  const heartIcons = {
    checked: 'fa-solid fa-heart',
    unchecked: 'fa-regular fa-heart',
    unknown: 'fa-solid fa-heart-crack'
  }

  // Star-style checkbox
  const starIcons = {
    checked: 'fa-solid fa-star',
    unchecked: 'fa-regular fa-star',
    unknown: 'fa-solid fa-star-half-stroke'
  }
</script>

<CheckBox bind:value stateIcons={heartIcons} />
<CheckBox bind:value stateIcons={starIcons} />
\`\`\`

### Form Integration

\`\`\`svelte
<script>
  import { CheckBox } from '@rokkit/ui'

  let formData = $state({
    subscribe: false,
    terms: false
  })

  function handleSubmit() {
    console.log('Form data:', formData)
  }
</script>

<form onsubmit|preventDefault={handleSubmit}>
  <div class="checkbox-field">
    <CheckBox name="subscribe" bind:value={formData.subscribe} />
    <label>Subscribe to newsletter</label>
  </div>

  <div class="checkbox-field">
    <CheckBox name="terms" bind:value={formData.terms} />
    <label>I agree to the terms and conditions</label>
  </div>

  <button type="submit" disabled={!formData.terms}>
    Submit
  </button>
</form>
\`\`\`

### Read-Only Display

\`\`\`svelte
<script>
  import { CheckBox } from '@rokkit/ui'

  const permissions = [
    { name: 'Read', granted: true },
    { name: 'Write', granted: true },
    { name: 'Delete', granted: false },
    { name: 'Admin', granted: false }
  ]
</script>

<h3>Your Permissions</h3>
{#each permissions as perm}
  <div class="checkbox-field">
    <CheckBox value={perm.granted} readOnly />
    <label>{perm.name}</label>
  </div>
{/each}
\`\`\`

## Related Components

- **Switch** - Alternative toggle component
- **Toggle** - Multi-option toggle
- **RadioGroup** - Single selection from multiple options
- **Icon** - Used for checkbox icons
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
