# Nested Data Management System

## Architecture Overview

This system follows an MVC-like pattern for managing nested data structures, implementing:

- **Model Layer**: Proxy classes to manage data state and operations
- **Controller Layer**: Actions to handle user interactions
- **View Layer**: Svelte components for rendering and updating the UI

## Components

- [NodeProxy](./NodeProxy.md)
- [ListProxy](./ListProxy.md)
- [NestedProxy](./NestedProxy.md)
- [FieldMapping](./FieldMapping.md)
- [Configuration](./Configuration.md)

## Event System

- **move**: Fired when focus changes
- **select**: Fired when selection changes
- **expand**: Fired when a node is expanded
- **collapse**: Fired when a node is collapsed

## Implementation Notes

- Use ESM modules with JSDoc comments for type documentation
- Leverage Svelte's reactive state management with $state
- Method chaining for intuitive API (createProxy(data).setOptions(options)...)
- ARIA attributes for accessibility compliance
- Clear separation between data management and UI interaction
- Attribute access through both node.attributes.text and node.get('text') patterns
