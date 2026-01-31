# Forms System Design

> Architecture and implementation details for Rokkit's dynamic form generation system

## Overview

The FormBuilder system follows a layered architecture with clear separation of concerns:

- **Data Layer**: FormBuilder class manages state and reactivity
- **Presentation Layer**: Snippet-based rendering with flexible layouts
- **Integration Layer**: Unified property composition and event handling

## Architecture

### Core Components

| Component | Purpose |
|-----------|---------|
| `FormBuilder` | Core reactive state management |
| `FormRenderer` | Snippet-based rendering system |
| `Input` | Universal input wrapper |
| `InputField` | Labeled input with validation |

### Data Flow

```
Data → Schema Derivation → Layout Derivation → Elements → FormRenderer → UI
                ↓                    ↓              ↓
        (optional override)  (optional override)  (validation state)
```

## Design Principles

### 1. Simple Constructor Pattern

```javascript
// Automatic derivation
const form = new FormBuilder(data)

// With schema override
const form = new FormBuilder(data, customSchema)

// With complete control
const form = new FormBuilder(data, customSchema, customLayout)
```

### 2. Separate Validation State

Validation is managed independently from data/schema/layout:

```javascript
// Set field validation
form.setFieldValidation('email', { state: 'error', text: 'Invalid email' })

// Clear validation
form.clearValidation('email')
```

### 3. Property Composition

Schema + layout + validation properties are merged into a single props object:

```javascript
const props = {
  // Display
  label: 'Email Address',
  description: "We'll never share your email",
  
  // Message system
  message: { state: 'error', text: 'Please enter a valid email' },
  
  // Events
  onchange: handleChange,
  
  // Schema constraints
  required: true,
  pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$',
  
  // Layout
  placeholder: 'user@example.com'
}
```

### 4. Element Structure

Each form element has a consistent structure:

```javascript
{
  scope: '#/fieldPath',     // JSON Pointer to field
  type: 'input',            // Element type
  value: currentValue,      // Current field value
  override: false,          // Use custom snippet?
  props: { ... }            // Composed properties
}
```

## Schema Formats

### Array Schema (Field-centric)

```javascript
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
  }
]
```

### Object Schema (JSON-schema style)

```javascript
const schema = {
  type: 'object',
  properties: {
    first_name: { type: 'string', required: true },
    age: { type: 'number', min: 18, max: 99 },
    gender: {
      type: 'enum',
      options: [{ id: 'M', value: 'Male' }],
      fields: { value: 'id', text: 'value' }
    }
  }
}
```

## Layout Schema

Controls visual arrangement:

```javascript
const layout = {
  type: 'vertical',
  elements: [
    {
      title: 'Personal Info',
      type: 'horizontal',
      elements: [
        { label: 'First Name', scope: '#/first_name' },
        { label: 'Last Name', scope: '#/last_name' }
      ]
    },
    { label: 'Age', scope: '#/age' }
  ]
}
```

### Layout Types

| Type | Description |
|------|-------------|
| `vertical` | Stack fields vertically |
| `horizontal` | Arrange fields side-by-side |
| `group` | Logical field groupings |
| `section` | Major form sections |

## Snippet-Based Rendering

### Default Input Snippet

```svelte
{#snippet defaultInput(element)}
  <label>
    {element.props.label}
    <Input type={element.type} bind:value={element.value} {...element.props} />
    {#if element.props.message}
      <div class="message message-{element.props.message.state}">
        {element.props.message.text}
      </div>
    {/if}
  </label>
{/snippet}
```

### Custom Child Snippet

```svelte
{#snippet child(element)}
  <MyCustomInput
    type={element.type}
    bind:value={element.value}
    {...element.props}
  />
{/snippet}
```

## Type-Aware Layouts

Different input types have different default layouts:

| Type | Layout |
|------|--------|
| Standard (text, number, email) | Label above input |
| Checkbox | Checkbox first, label on right |
| Switch | Inline layout with label |
| Custom | Via child snippet override |

## Validation System

### Message Object Structure

```javascript
{
  state: 'error' | 'warning' | 'info' | 'success',
  text: 'Message content'
}
```

### Validation Timing

| Trigger | Description |
|---------|-------------|
| `onChange` | Real-time as user types |
| `onBlur` | When field loses focus |
| `onSubmit` | Form submission |

### Built-in Validators

- `required` - Field must have value
- `minLength` / `maxLength` - String length constraints
- `min` / `max` - Numeric range
- `pattern` - Regex matching

## Implementation Status

### Completed

- [x] FormBuilder class with reactive state
- [x] Three-parameter constructor
- [x] Schema derivation from data
- [x] Layout derivation from data
- [x] Basic input type support
- [x] Separate validation state
- [x] Property composition system

### In Progress

- [ ] Input.svelte universal wrapper
- [ ] Type-aware rendering
- [ ] FormRenderer validation integration
- [ ] Accessibility (ARIA live regions)

### Planned

- [ ] Date/time pickers
- [ ] File upload with validation
- [ ] Multi-step forms
- [ ] Conditional field display
- [ ] Field arrays (repeating groups)

## Extension Points

### Adding New Input Types

1. Add type handling to Input.svelte wrapper
2. Define layout behavior for the type
3. Map schema properties to input attributes
4. Add validation rules if needed

### Custom Rendering

Use the `child` snippet for complete control:

```svelte
<FormRenderer {form}>
  {#snippet child(element)}
    {#if element.scope === '#/customField'}
      <MySpecialInput {element} />
    {:else}
      {@render defaultInput(element)}
    {/if}
  {/snippet}
</FormRenderer>
```

## Performance Considerations

- Precise reactivity: Only re-render changed fields
- Efficient property composition: Cached merging
- Debounced validation for real-time feedback
- Lazy field registration

## Related Files

- `packages/forms/src/` - Form components
- `docs/llms/forms/llms.txt` - User documentation
- `.rules/project/progress.md` - Implementation status
