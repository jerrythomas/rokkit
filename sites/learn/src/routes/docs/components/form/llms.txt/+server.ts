import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit Forms

> Data-driven form generation with schema and layout separation

Rokkit Forms follows a JSON-forms style architecture with separate data-schema and layout-schema for rendering dynamic forms.

## Quick Start

\`\`\`svelte
<script>
  import { Form } from '@rokkit/ui'
  let value = $state({
    name: 'John Doe',
    gender: 'male',
    email: 'john.doe@example.com',
    age: 30
  })
</script>

<Form bind:value />
\`\`\`

The simplest usage: pass a reactive \`value\` object and the Form auto-detects field types.

## Core Concepts

### Progressive Enhancement Layers

1. **Basic** - Auto-detect types from value object
2. **Schema** - Define field types, validation, options
3. **Layout** - Control arrangement with rows, columns, groups

### Two Schema Styles

**Array Schema** (simpler, field-centric):
\`\`\`javascript
const schema = [
  {
    key: 'name',
    label: 'Name',
    type: 'input',
    description: 'Enter your name',
    props: {
      type: 'text',
      required: true,
      minLength: 2
    }
  },
  {
    key: 'email',
    label: 'Email',
    type: 'input',
    props: {
      type: 'email',
      required: true
    }
  }
]
\`\`\`

**Object Schema** (JSON-schema style):
\`\`\`javascript
const schema = {
  type: 'object',
  properties: {
    first_name: { type: 'string', required: true },
    last_name: { type: 'string', required: true },
    gender: {
      type: 'enum',
      required: true,
      options: [
        { id: 'M', value: 'Male' },
        { id: 'F', value: 'Female' }
      ],
      fields: { value: 'id', text: 'value' }
    },
    age: { type: 'number', min: 18, max: 99 }
  }
}
\`\`\`

## Layout Schema

Controls visual arrangement of form fields.

\`\`\`javascript
const layout = {
  type: 'vertical',
  elements: [
    {
      title: 'Name',
      type: 'horizontal',
      elements: [
        { label: 'First Name', scope: '#/first_name' },
        { label: 'Last Name', scope: '#/last_name' }
      ]
    },
    { label: 'Gender', scope: '#/gender' },
    { label: 'Age', scope: '#/age' }
  ]
}
\`\`\`

### Layout Elements

| Element | Purpose |
|---------|---------|
| \`vertical\` | Stack fields vertically |
| \`horizontal\` | Arrange fields side-by-side |
| \`group\` | Logical field groupings |
| \`section\` | Major form sections |

### Layout Properties

| Property | Description |
|----------|-------------|
| \`scope\` | JSON pointer to field (\`#/fieldname\`) |
| \`label\` | Field label override |
| \`title\` | Section/group title |
| \`width\` | Field width (1-12 grid) |
| \`span\` | Column span |
| \`offset\` | Left margin spacing |

## Complete Example

\`\`\`svelte
<script>
  import { Form } from '@rokkit/ui'

  const schema = {
    type: 'object',
    properties: {
      first_name: { type: 'string', required: true },
      last_name: { type: 'string', required: true },
      gender: {
        type: 'enum',
        required: true,
        options: [
          { id: 'M', value: 'Male' },
          { id: 'F', value: 'Female' }
        ],
        fields: { value: 'id', text: 'value' }
      },
      age: { type: 'number', min: 18, max: 99 }
    }
  }

  const layout = {
    type: 'vertical',
    elements: [
      {
        title: 'Name',
        type: 'horizontal',
        elements: [
          { label: 'First Name', scope: '#/first_name' },
          { label: 'Last Name', scope: '#/last_name' }
        ]
      },
      { label: 'Gender', scope: '#/gender' },
      { label: 'Age', scope: '#/age' }
    ]
  }

  let value = $state({ first_name: '', last_name: '', gender: '', age: 25 })
</script>

<Form bind:value {schema} {layout} />
\`\`\`

## Field Types

### Basic Types
- \`string\` / \`text\` - Text input
- \`number\` - Numeric input with min/max
- \`email\` - Email validation
- \`date\` - Date picker
- \`boolean\` - Checkbox/toggle

### Selection Types
- \`enum\` - Dropdown/select with options
- \`radio\` - Radio button group
- \`checkbox\` - Multiple selection

### Options Configuration
\`\`\`javascript
{
  type: 'enum',
  options: [
    { id: 'value1', value: 'Display 1' },
    { id: 'value2', value: 'Display 2' }
  ],
  fields: { value: 'id', text: 'value' }
}
\`\`\`

## Validation

### Built-in Validators
- \`required\` - Field must have value
- \`minLength\` / \`maxLength\` - String length
- \`min\` / \`max\` - Numeric range
- \`pattern\` - Regex matching

### Validation Props
\`\`\`javascript
{
  key: 'age',
  type: 'input',
  props: {
    type: 'number',
    required: true,
    min: 18,
    max: 99
  }
}
\`\`\`

### Validation Timing
- \`onBlur\` - When user leaves field
- \`onChange\` - As user types
- \`onSubmit\` - When form submitted

## FormBuilder API

For programmatic form management:

\`\`\`javascript
import { FormBuilder } from '@rokkit/forms'

// Create with data only (auto-derive schema/layout)
const form = new FormBuilder(data)

// Create with schema override
const form = new FormBuilder(data, customSchema)

// Create with full control
const form = new FormBuilder(data, customSchema, customLayout)

// Access form state
form.data      // Current form data
form.schema    // Form schema
form.layout    // Form layout
form.elements  // Rendered elements

// Update field
form.setFieldValue('email', 'new@example.com')

// Validation
form.setFieldValidation('email', { state: 'error', text: 'Invalid email' })
form.clearValidation('email')
\`\`\`

## FormRenderer Component

For custom rendering with snippets:

\`\`\`svelte
<script>
  import { FormRenderer } from '@rokkit/forms'
  import { FormBuilder } from '@rokkit/forms'

  const form = new FormBuilder(data, schema, layout)
</script>

<FormRenderer {form}>
  {#snippet defaultInput(element)}
    <label>
      {element.props.label}
      <input type={element.type} bind:value={element.value} {...element.props} />
    </label>
  {/snippet}

  {#snippet child(element)}
    <!-- Custom rendering for specific fields -->
    <MyCustomInput {element} />
  {/snippet}
</FormRenderer>
\`\`\`

## Responsive Behavior

Layouts automatically adapt:
- **Desktop**: Full multi-column layouts
- **Tablet**: Reduced columns
- **Mobile**: Single-column stack

## Accessibility

- Logical tab order maintained
- Screen reader friendly structure
- ARIA attributes for errors
- Keyboard navigation support
- High contrast error styling

## API Reference

### Form Props

| Prop | Type | Description |
|------|------|-------------|
| \`value\` | \`object\` | Form data (use \`bind:value\`) |
| \`schema\` | \`array\\|object\` | Field definitions |
| \`layout\` | \`object\` | Layout structure |

### FormBuilder Constructor

| Parameter | Type | Description |
|-----------|------|-------------|
| \`data\` | \`object\` | Initial form data |
| \`schema\` | \`array\\|object\` | Optional schema override |
| \`layout\` | \`object\` | Optional layout override |

## Import

\`\`\`javascript
// High-level Form component
import { Form } from '@rokkit/ui'

// Low-level building blocks
import { FormBuilder, FormRenderer } from '@rokkit/forms'
import { InputField, Input } from '@rokkit/forms'
\`\`\`
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
