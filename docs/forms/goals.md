# FormBuilder Goals & Architecture Summary

## Core Vision

Build a flexible, powerful form system that combines the simplicity of automatic form generation with the flexibility of complete customization. The system should be intuitive for simple use cases while providing unlimited extensibility for complex requirements.

## Architectural Philosophy

### Clean Separation of Concerns
- **Data Layer**: FormBuilder class manages state and reactivity
- **Presentation Layer**: Snippet-based rendering with flexible layouts
- **Integration Layer**: Unified property composition and event handling

### Progressive Enhancement
- **Default behavior**: Automatic schema and layout derivation
- **Schema override**: Custom validation rules and constraints
- **Layout override**: Custom styling and arrangement
- **Complete override**: Custom snippets for specialized requirements

## Core Design Principles

### 1. Simple Constructor Pattern
```javascript
// Automatic derivation
const form = new FormBuilder(data)

// With schema override
const form = new FormBuilder(data, customSchema)

// With complete control
const form = new FormBuilder(data, customSchema, customLayout)
```

### 2. Enhanced Input Component Architecture
```svelte
// Universal Input.svelte wrapper
<Input {type} bind:value {...props} />

// Props contain complete context:
// - label, description, message, messageType
// - schema constraints (min, max, required, pattern)
// - layout properties (className, placeholder, disabled)
// - event handlers (onchange, onfocus, onblur)
```

### 3. Clean Snippet Interface
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
  <!-- Complete control with all context available in props -->
  <MyCustomInput {type} bind:value {...props} />
{/snippet}
```

### 4. Type-Aware Layout System
- **Standard**: Label above input (text, number, email, etc.)
- **Checkbox**: Checkbox first, label on the right
- **Switch**: Inline layout with label
- **Custom**: Complete override through child snippet

### 5. Comprehensive Message System
```javascript
const messageTypes = {
  error: "Validation failures, required field missing",
  warning: "Potential issues, format suggestions",
  info: "Helpful hints, character counts, examples",
  success: "Confirmation messages, validation passed"
}
```

## Implementation Goals

### Phase 1: Enhanced Input Architecture ✅ Foundation
- [x] Three-parameter constructor: `new FormBuilder(data, schema, layout)`
- [x] Schema property standardization (`min`/`max` + `minimum`/`maximum`)
- [x] Basic input type support with clean HTML implementation
- [ ] **Current Goal**: Create Input.svelte wrapper with universal input support
- [ ] Add `label`, `description`, `message`, `messageType` properties
- [ ] Implement type-aware rendering (checkbox, switch, standard layouts)
- [ ] Integrate message state management with type-based styling

### Phase 2: Snippet-Based Rendering System
- [ ] Create `defaultInput` snippet with type-aware layouts
- [ ] Implement custom `child` snippet support for complete override
- [ ] Property composition system (schema + layout + message properties)
- [ ] Snippet selection logic (`defaultInput` vs custom `child`)
- [ ] Replace current HTML rendering with snippet system

### Phase 3: Validation & Message Integration
- [ ] Schema-based validation rule integration
- [ ] Real-time validation triggers (change, blur, submit)
- [ ] Inline message display with messageType styling
- [ ] Custom validation function support
- [ ] Accessibility compliance with ARIA live regions

### Phase 4: Advanced Customization & Extension
- [ ] Advanced custom snippet patterns
- [ ] Theme integration across all rendering modes
- [ ] Extension documentation and examples
- [ ] Performance optimization for complex forms

## Key Benefits

### For Simple Use Cases
```javascript
// Just works - automatic everything
const form = new FormBuilder({
  name: "",
  email: "",
  age: 0,
  subscribe: false
})
```

### For Custom Requirements
```svelte
{#snippet customEmailInput(type, value, props)}
  <div class="custom-email-wrapper">
    <label>{props.label}</label>
    <div class="input-with-domain">
      <Input {type} bind:value {...props} />
      <span class="domain">@company.com</span>
    </div>
    {#if props.message}
      <div class="message-{props.messageType}">{props.message}</div>
    {/if}
  </div>
{/snippet}
```

### Property Composition Power
```javascript
// All context available in props object
const props = {
  // Display
  label: "Email Address",
  description: "We'll never share your email",

  // Message system
  message: "Please enter a valid email",
  messageType: "error",

  // Events
  onchange: handleChange,

  // Schema constraints
  required: true,
  pattern: "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$",

  // Layout
  placeholder: "user@example.com",
  className: "custom-input"
}
```

## Success Criteria

### Developer Experience
- **Intuitive API**: Simple constructor, clear property names
- **Progressive complexity**: Start simple, add complexity as needed
- **Consistent patterns**: Same signature across all snippets
- **Complete control**: Custom snippets for any requirement

### User Experience
- **Rich feedback**: Error, warning, info, success message types
- **Accessible**: Proper ARIA attributes and live regions
- **Responsive**: Type-aware layouts that work on all devices
- **Performance**: Fast rendering and minimal re-renders

### Technical Excellence
- **Clean architecture**: Clear separation of concerns
- **Extensible**: Easy to add new input types and behaviors
- **Testable**: Unit, integration, and component test support
- **Maintainable**: Clear patterns and comprehensive documentation

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
