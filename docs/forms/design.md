# FormBuilder Design Documentation

## Architecture Overview

The FormBuilder system follows a layered architecture with clear separation of concerns:

### Data Layer

- **FormBuilder class**: Core reactive state management
- **Schema derivation**: Automatic schema generation from data
- **Layout derivation**: Automatic layout generation from data
- **Field updates**: Immutable data updates with reactivity

### Presentation Layer

- **FormRenderer component**: Snippet-based rendering system with flexible layout support
- **Enhanced Input components**: Wrapper components with label, description, message, and messageType support
- **Layout-aware rendering**: Type-specific layouts (checkbox right-label, switch inline, standard top-label)
- **Dynamic mapping**: Type-based element selection with property composition
- **Custom snippets**: Override capability for specialized input requirements
- **Validation integration**: Inline error messages and validation state styling

### Integration Layer

- **Config system**: Demo data and examples
- **Event handling**: Unified onchange events
- **Property mapping**: Schema to input attribute mapping

## Core Design Principles

### Constructor Design

- Simple three-parameter constructor: `new FormBuilder(data, schema, layout)`
- Optional schema and layout parameters
- Automatic derivation when not provided
- Clear parameter order: data first, then overrides

### Schema Property Mapping

- Support both `min`/`max` and `minimum`/`maximum`
- Direct mapping to HTML input attributes
- Backward compatibility with JSON Schema
- Intuitive property names for developers

### Enhanced Input Component System

- **Wrapper Input.svelte**: Universal input wrapper supporting all types
- **Enhanced properties**: label, description, message, messageType (error, warning, info, success), validation state
- **Layout-aware rendering**: Type-specific label positioning and structure
- **Validation integration**: Built-in message display with type-based styling and state management
- **Accessibility support**: Proper ARIA attributes and form associations

### Snippet-Based Rendering

- **Default snippets**: Standard layouts for each input type
- **Custom snippet support**: `child` snippet for complete customization
- **Consistent interface**: `(type, value, props)` signature across all snippets
- **Property composition**: Schema + layout + message properties merged into props object
- **Flexible override**: Per-field custom rendering while maintaining form consistency

```svelte
{#snippet defaultInput(type, value, props)}
  <label>
    {props.label}
    <Input {type} bind:value {...props} />
    {#if props.message}
      <div class="message message-{props.messageType}">{props.message}</div>
    {/if}
  </label>
{/snippet}

{#snippet customChild(type, value, props)}
  <!-- props contains: label, description, message, messageType, onchange, plus schema/layout properties -->
  <MyCustomInput {type} bind:value {...props} />
{/snippet}
```

### Component Integration

- **Enhanced Input wrapper**: Unifies @rokkit/forms components with layout and message system
- **Unified properties**: `value` as direct parameter, `label`, `description`, `message`, `messageType` in props object
- **Standard event handling**: `onchange` event emission with validation triggers
- **Property composition**: Schema constraints + layout properties + message state merged into props
- **Flexible rendering**: Support for both default layouts and custom snippets

### Dynamic Rendering System

- **Snippet selection**: Choose between `defaultInput` and custom `child` snippets
- **Property composition**: Merge schema, layout, and message properties into props object
- **Layout-aware defaults**: Type-specific default layouts (checkbox, switch, standard)
- **Custom override pattern**: `{@render child(type, value, props)}` where props includes label, description, message, messageType
- **Fallback system**: Default input rendering for unknown types
- **Message integration**: Automatic message display with type-based styling (error, warning, info, success)

## Data Flow

### Initialization

1. Data provided to FormBuilder constructor
2. Schema derived or provided
3. Layout derived or provided
4. Elements generated from schema + layout
5. FormRenderer receives elements for display

### User Interaction

1. User interacts with enhanced input component
2. Component emits onchange event with new value
3. FormRenderer triggers validation (if configured)
4. FormRenderer calls onUpdate callback with validated data
5. FormBuilder updates internal data state and message state
6. Reactive system triggers element regeneration with updated messages
7. UI updates automatically with new values and message feedback

### Customization Flow

1. **Default rendering**: Enhanced Input components with type-aware layouts
2. **Property composition**: Schema + layout + message properties merged into props object
3. **Snippet selection**: Choose `defaultInput` or custom `child` snippet per field
4. **Custom snippet interface**: `(type, value, props)` signature where props contains all context
5. **Message integration**: Message content and type (error, warning, info, success) passed through props
6. **Layout flexibility**: Support for different label positions and structures

```javascript
// Example props object passed to snippets
const props = {
  label: 'Email Address',
  description: "We'll never share your email",
  message: 'Please enter a valid email address',
  messageType: 'error',
  onchange: handleChange,
  required: true,
  placeholder: 'user@example.com'
  // ...other schema and layout properties
}
```

## Extension Points

### New Input Types

- **Enhanced Input support**: Add new type to Input.svelte wrapper
- **Layout definition**: Define label positioning and structure for new type
- **Property mapping**: Map schema properties to input attributes
- **Validation rules**: Define validation behavior for new input type
- **Custom snippets**: Create specialized rendering if default layout insufficient

### Enhanced Input Properties

- **Label management**: Support for label text, positioning, and requirements
- **Description text**: Helpful hints and instructions below inputs
- **Message system**: Unified message display with messageType (success, warning, error, info)
- **Validation state**: Message type flags, validation status, and contextual feedback
- **Accessibility**: ARIA attributes, form associations, and screen reader support

### Validation System

- **Schema-based validation**: Rules defined in field schema
- **Real-time feedback**: Validation on change, blur, or submit
- **Message display**: Inline messages with type-based styling (error, warning, info, success)
- **Message state management**: Comprehensive messageType system for all feedback types
- **Custom validation functions**: Support for complex validation logic
- **Accessibility compliance**: Proper message announcement and form associations with ARIA live regions

### Layout and Rendering Variations

- **Type-specific layouts**: Checkbox (right-label), Switch (inline), Standard (top-label)
- **Custom snippet system**: Complete override with `child` snippet
- **Property-driven rendering**: Layout properties control appearance and behavior
- **Responsive design**: Adaptive layouts for different screen sizes
- **Form organization**: Section grouping, field ordering, and conditional display
- **Theme integration**: Consistent styling across all rendering modes

### Theming System

- Theme props passed through snippets
- Consistent styling across components
- Override capability for special cases
- CSS custom properties integration

## Implementation Guidelines

### Enhanced Input Architecture

- **Wrapper pattern**: Input.svelte as universal wrapper for all input types
- **Property composition**: Merge schema, layout, and validation properties
- **Type-aware rendering**: Different layouts based on input type
- **Message integration**: Built-in message handling with type-based styling and state management

### State Management

- **Svelte 5 runes**: Reactive state with $state, $derived, $effect
- **Private properties**: Internal state with public getters/setters
- **Immutable updates**: Data changes trigger validation and re-rendering
- **Derived validation**: Computed validation state from data and rules
- **Message state tracking**: Per-field message content and type (error, warning, info, success)

### Component Patterns

- **Snippet interfaces**: Clean `(type, value, props)` signature where props contains all context
- **Property composition**: Schema + layout + message state merged into single props object
- **Event handling**: Standard `onchange` with validation triggers passed through props
- **Layout awareness**: Type-specific rendering patterns (checkbox, switch, standard)
- **Optional chaining**: Safe access to nested properties through props object
- **Props spreading**: Easy attribute mapping with `{...props}` pattern

### Testing Strategy

- Unit tests for FormBuilder class
- Component tests for FormRenderer
- Integration tests for complete flows
- Demo scenarios as integration tests

### Performance Considerations

- **Precise reactivity**: Only re-render changed fields and message states
- **Efficient property composition**: Cached merging of schema, layout, and message properties
- **Snippet optimization**: Reuse default snippets, lazy load custom ones
- **Validation efficiency**: Debounced validation for real-time feedback
- **Memory management**: Cleanup validation watchers and event handlers
