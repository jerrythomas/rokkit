# Rokkit Architecture Principles

## Core Design Philosophy

Rokkit is built on the principle that **data should drive the interface**, not the other way around. Components should adapt to your data structure rather than forcing you to transform data to match component expectations.

## Fundamental Principles

### 1. Data-First Design

**Principle**: Components automatically understand and adapt to data structures.

**Implementation**:
```svelte
<!-- Data shapes the component, not vice versa -->
<List items={users} fields={{ text: 'fullName', image: 'avatar' }} />
<List items={products} fields={{ text: 'title', image: 'thumbnail' }} />
```

**Benefits**:
- Eliminates data transformation layers
- Reduces boilerplate code
- Enables rapid prototyping
- Simplifies API integration

### 2. Composable Flexibility

**Principle**: Every component should be extensible without modification.

**Implementation**:
```svelte
<!-- Custom rendering through snippets -->
<List {items}>
  {#snippet customItem(node)}
    <MyCustomComponent data={node.value} />
  {/snippet}
</List>
```

**Benefits**:
- No need to fork components
- Maintains upgrade path
- Enables design system integration
- Supports complex use cases

### 3. Consistent API Patterns

**Principle**: Similar components should behave similarly.

**Standard Props Pattern**:
- `items` / `options`: Data array
- `value`: Current selection(s)
- `fields`: Field mapping configuration
- `using`: Component override system

**Standard Events Pattern**:
- `select`: Item selection
- `change`: Value changes
- `move`: Navigation/focus changes

### 4. Progressive Enhancement

**Principle**: Start simple, add complexity as needed.

**Levels of Usage**:
1. **Basic**: `<List items={stringArray} />`
2. **Mapped**: `<List items={objects} fields={mapping} />`
3. **Custom**: `<List items={objects} {fields} {using} />`
4. **Advanced**: Custom snippets and complex behaviors

### 5. Accessibility by Default

**Principle**: Components should be accessible without additional configuration.

**Implementation**:
- ARIA attributes automatically applied
- Keyboard navigation built-in
- Screen reader support included
- Focus management handled

## Component Architecture Patterns

### Selection Components Pattern

All selection components follow this structure:

```typescript
interface SelectionComponent {
  items: T[]                    // Data array
  value: T | T[] | null        // Selected item(s)
  fields: FieldMapping         // Data mapping
  using: ComponentMap          // Custom components
  multiple?: boolean           // Multi-selection
}
```

**Examples**: List, Tabs, Select, MultiSelect, Switch

### Hierarchical Components Pattern

Components dealing with nested data:

```typescript
interface HierarchicalComponent {
  items: TreeNode<T>[]         // Nested data
  value: T | null              // Selected item
  fields: NestedFieldMapping   // Nested mapping
  autoClose?: boolean          // Behavior control
}
```

**Examples**: Tree, Accordion, NestedList

### Input Components Pattern

Form input components:

```typescript
interface InputComponent {
  value: T                     // Current value
  placeholder?: string         // Hint text
  disabled?: boolean          // State control
  required?: boolean          // Validation
}
```

**Examples**: Rating, Range, InputField

## Field Mapping System

### Core Concept

The field mapping system allows components to adapt to any data structure:

```javascript
// Default expectations
const defaultFields = {
  text: 'text',
  image: 'image',
  icon: 'icon',
  value: 'value',
  children: 'children'
}

// Custom mapping
const customFields = {
  text: 'name',        // Map 'name' to text display
  image: 'avatar',     // Map 'avatar' to image display
  children: 'items'    // Map 'items' to nested children
}
```

### Advanced Mapping Features

**Nested Field Access**:
```javascript
const fields = {
  text: 'user.profile.displayName',
  image: 'user.profile.avatar.url'
}
```

**Dynamic Field Selection**:
```javascript
const fields = {
  text: (item) => `${item.firstName} ${item.lastName}`,
  image: (item) => item.avatar || '/default-avatar.png'
}
```

## Component Override System

### Using Property Pattern

The `using` property allows complete component replacement:

```svelte
<script>
  import CustomItem from './CustomItem.svelte'
  
  const using = {
    default: CustomItem,  // Default component
    special: SpecialItem  // Component for items with type='special'
  }
</script>

<List {items} {using} />
```

### Snippet System (Svelte 5)

Modern approach using snippets:

```svelte
<List {items}>
  {#snippet stub(node)}
    <CustomItem value={node.value} />
  {/snippet}
  {#snippet special(node)}
    <SpecialItem value={node.value} />
  {/snippet}
</List>
```

## State Management Patterns

### Reactive Value Binding

Components use Svelte's reactive binding system:

```svelte
<script>
  let selectedUser = $state(null)
  let users = $state([...])
</script>

<List items={users} bind:value={selectedUser} />
```

### Event-Driven Updates

Components emit standard events for integration:

```svelte
<List 
  {items}
  onselect={(e) => handleSelection(e.detail)}
  onchange={(e) => updateValue(e.detail)}
/>
```

## Performance Principles

### Lazy Evaluation

- Field mappings computed on-demand
- Component rendering deferred until needed
- Virtual scrolling for large datasets

### Optimal Re-rendering

- Fine-grained reactivity using Svelte 5 runes
- Minimal DOM updates through efficient diffing
- Component-level memoization where appropriate

### Bundle Optimization

- Tree-shakeable component exports
- Minimal runtime overhead
- Optional feature loading

## Error Handling Philosophy

### Graceful Degradation

Components should continue working with imperfect data:

```svelte
<!-- Component handles missing fields gracefully -->
<List items={incompleteData} fields={{ text: 'name' }} />
```

### Developer-Friendly Errors

- Clear error messages in development
- Helpful warnings for common mistakes
- TypeScript support for compile-time safety

## Testing Strategy

### Component Testing Levels

1. **Unit Tests**: Individual component behavior
2. **Integration Tests**: Component interactions
3. **Accessibility Tests**: ARIA and keyboard navigation
4. **Visual Tests**: Rendering consistency
5. **Performance Tests**: Rendering and interaction speed

### Testing Principles

- Test behavior, not implementation
- Focus on user interactions
- Verify accessibility requirements
- Performance regression detection

## Migration & Versioning Strategy

### Backward Compatibility

- Maintain API compatibility where possible
- Provide clear migration paths
- Deprecation warnings with timelines
- Gradual feature introduction

### Version Management

- Semantic versioning (semver)
- Clear changelog documentation
- Migration guides for major versions
- LTS support for enterprise users

## Integration Guidelines

### Framework Integration

**Primary**: Svelte/SvelteKit native support  
**Secondary**: Framework adapters (React, Vue)  
**Tertiary**: Web Components for universal use

### Styling Integration

**CSS Frameworks**: Works with Tailwind, UnoCSS, Bootstrap  
**Design Systems**: Adaptable to any design token system  
**Custom Themes**: Full CSS variable support

### Build Tool Compatibility

- Vite (primary)
- Webpack (supported)
- Rollup (supported)
- esbuild (community)

## Future-Proofing Strategies

### Technology Adoption

- Early adoption of stable Svelte features
- Careful evaluation of experimental features
- Community feedback integration
- Performance benchmark maintenance

### Ecosystem Evolution

- Regular dependency updates
- Security vulnerability monitoring
- Community contribution guidelines
- Open source governance model