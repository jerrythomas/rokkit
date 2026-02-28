# Messages

> Global localization singleton — provides UI string overrides for component empty states and labels.

**Package**: `@rokkit/states`
**File**: `messages.svelte.js`
**Import**: `import { messages } from '@rokkit/states'`

## Properties

```javascript
messages.current     // Current messages object ($state)
```

## Methods

```javascript
messages.set(customMessages)    // Merge custom messages with defaults
messages.reset()                // Reset to default messages
```

## Default Messages

```javascript
{
  emptyList: 'No items',
  emptyTree: 'No items',
  loading: 'Loading...',
  noResults: 'No results',
  select: 'Select...',
  search: 'Search...'
}
```

## Example

```javascript
import { messages } from '@rokkit/states'

// Localize on app init
messages.set({
  emptyList: 'Aucun élément',
  noResults: 'Aucun résultat',
  select: 'Sélectionner...',
  search: 'Rechercher...'
})
```

## Notes

- Components read from `messages.current` reactively — updating `messages` immediately affects all rendered components.
- Partial overrides are merged with defaults — only specify the strings you need to change.
