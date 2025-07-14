# FormBuilder System Documentation

## Core Vision

Build a flexible, powerful form system that combines the simplicity of automatic form generation with the flexibility of complete customization. The system should be intuitive for simple use cases while providing unlimited extensibility for complex requirements.

## Quick Start

```javascript
// Automatic derivation - just works
const form = new FormBuilder({
  name: '',
  email: '',
  age: 0,
  subscribe: false
})

// With schema override
const form = new FormBuilder(data, customSchema)

// With complete control
const form = new FormBuilder(data, customSchema, customLayout)
```

## Architecture Overview

### Clean Separation of Concerns

- **Data Layer**: FormBuilder class manages state and reactivity
- **Presentation Layer**: Snippet-based rendering with flexible layouts
- **Integration Layer**: Unified property composition and event handling

### Progressive Enhancement

- **Default behavior**: Automatic schema and layout derivation
- **Schema override**: Custom validation rules and constraints
- **Layout override**: Custom styling and arrangement
- **Complete override**: Custom snippets for specialized requirements

## Key Design Principles

### 1. Enhanced Input Component Architecture

```svelte
// Universal Input.svelte wrapper
<Input {type} bind:value {...props} />

// Props contain complete context:
// - label, description, message object { state, text }
// - schema constraints (min, max, required, pattern)
// - layout properties (className, placeholder, disabled, custom properties)
// - event handlers (onchange, onfocus, onblur)
```

### 2. Clean Snippet Interface

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

{#snippet child(element)}
  <!-- Complete control with all context available in element -->
  <MyCustomInput type={element.type} bind:value={element.value} {...element.props} />
{/snippet}
```

### 3. Type-Aware Layout System

- **Standard**: Label above input (text, number, email, etc.)
- **Checkbox**: Checkbox first, label on the right
- **Switch**: Inline layout with label
- **Custom**: Complete override through child snippet

### 4. Separate Validation State Management

```javascript
// Validation messages structure
const message = {
  state: 'error', // 'error', 'warning', 'info', 'success'
  text: 'This field is required'
}

// Validation state managed separately from data/schema/layout
builder.setFieldValidation('email', {
  state: 'error',
  text: 'Please enter a valid email address'
})

// Clear validation for a field
builder.setFieldValidation('email', null)
```

### 5. Flexible Property Composition

```javascript
// Element structure with composed props
const element = {
  scope: '#/email',
  type: 'email',
  value: 'user@example.com',
  override: false,
  props: {
    // From layout
    label: 'Email Address',
    description: "We'll never share your email",
    placeholder: 'Enter your email',
    className: 'custom-input',
    customProperty: 'any-value', // Arbitrary properties supported

    // From schema
    required: true,
    pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$',
    maxLength: 100,

    // From validation state
    message: {
      state: 'error',
      text: 'Please enter a valid email address'
    }
  }
}
```

## Implementation Phases

### Phase 1: Enhanced Input Architecture ✅ Foundation

- [x] Three-parameter constructor: `new FormBuilder(data, schema, layout)`
- [x] Schema property standardization (`min`/`max` + `minimum`/`maximum`)
- [x] Basic input type support with clean HTML implementation
- [x] **Completed**: Updated FormBuilder with separate validation state
- [x] Property composition system (schema + layout + validation → props)
- [x] Flexible arbitrary property support from layout
- [ ] **Current Goal**: Create Input.svelte wrapper with universal input support
- [ ] Add `label`, `description`, `message` object properties
- [ ] Implement type-aware rendering (checkbox, switch, standard layouts)
- [ ] Integrate FormRenderer with user-action triggered validation

### Phase 2: Snippet-Based Rendering System

- [ ] Create `defaultInput` snippet with type-aware layouts
- [ ] Implement custom `child` snippet support for complete override
- [ ] FormRenderer with snippet selection logic (defaultInput vs child based on override flag)
- [ ] Replace current HTML rendering with snippet system
- [ ] Element-based snippet interface with scope, type, value, override, props

### Phase 3: Validation & Message Integration

- [x] **Completed**: Separate validation state in FormBuilder with dedicated methods
- [x] **Completed**: Validation utility with schema-based rules and message objects
- [ ] FormRenderer integration with user-action triggered validation
- [ ] Real-time validation triggers (change, blur, submit)
- [ ] Inline message display with state-based styling
- [ ] Custom validation function support
- [ ] Accessibility compliance with ARIA live regions

### Phase 4: Advanced Customization & Extension

- [ ] Advanced custom snippet patterns
- [ ] Theme integration across all rendering modes
- [ ] Extension documentation and examples
- [ ] Performance optimization for complex forms

## Success Criteria

### Developer Experience

- **Intuitive API**: Simple constructor, clear property names
- **Progressive complexity**: Start simple, add complexity as needed
- **Consistent patterns**: Same signature across all snippets
- **Complete control**: Custom snippets for any requirement

### User Experience

- **Rich feedback**: Message objects with state (error, warning, info, success) and text
- **Accessible**: Proper ARIA attributes and live regions
- **Responsive**: Type-aware layouts that work on all devices
- **Performance**: Fast rendering and minimal re-renders

### Technical Excellence

- **Clean architecture**: Clear separation of concerns
- **Extensible**: Easy to add new input types and behaviors
- **Testable**: Unit, integration, and component test support
- **Maintainable**: Clear patterns and comprehensive documentation

## Documentation Structure

- **[Design Documentation](./design.md)** - Detailed architecture and implementation guidelines
- **[Feature Tracking](./features.md)** - Current status, milestones, and implementation roadmap
- **API Reference** - Component interfaces and property specifications (coming soon)
- **Examples & Tutorials** - Practical usage patterns and customization guides (coming soon)

## Current Implementation Status

### ✅ Recently Completed

- **Separate validation state**: Independent validation management in FormBuilder
- **Property composition**: Schema + layout + validation merged into element props
- **Flexible property support**: Arbitrary layout properties passed through to components
- **Validation utility**: Schema-based validation with message object structure
- **Element structure**: Updated with scope, type, value, override, props pattern

### 🚧 In Progress

- **FormRenderer enhancement**: Snippet-based rendering with defaultInput and child snippets
- **Input.svelte wrapper**: Universal input component supporting all types
- **User-action validation**: Integration between FormRenderer and validation triggers

## Future Vision

### Advanced Input Types

- Date/time pickers with Input.svelte wrapper
- Multi-select components with enhanced properties
- File upload with validation and progress
- Rich text editors with custom snippets
- Color pickers with proper label positioning

### Enterprise Features

- Form templates and reusable schemas
- Advanced validation with custom functions
- Conditional field display and dynamic layouts
- Form analytics and user behavior tracking
- Internationalization and accessibility compliance

### Developer Ecosystem

- VS Code snippets for common patterns
- Storybook integration for component documentation
- TypeScript definitions for full type safety
- Community-contributed input types and themes
- Plugin system for advanced extensions

This architecture provides the foundation for a form system that grows with your needs - simple by default, powerful when required.
