# @rokkit/bits-ui

Data-driven UI components built on top of [bits-ui](https://bits-ui.com/).

## Overview

This library provides a data-driven version of UI components built on top of bits-ui unstyled components. It combines the flexibility of bits-ui's headless approach with a data-driven API to provide a better developer experience.

## Installation

```bash
npm install @rokkit/bits-ui bits-ui @rokkit/states
```

## Components

### List

A data-driven list component that supports selection, filtering, and custom rendering using `@rokkit/states` Proxy for field mapping.

```svelte
<script>
  import { List } from '@rokkit/bits-ui'

  // Sample data
  const items = [
    { id: '1', name: 'Item 1', description: 'Description 1' },
    { id: '2', name: 'Item 2', description: 'Description 2' },
    { id: '3', name: 'Item 3', description: 'Description 3' }
  ]

  // Field mappings
  const fields = {
    id: 'id',
    label: 'name',
    description: 'description'
  }

  // Selected item
  let selectedItem = $state(null)

  function handleSelect(event) {
    console.log('Selected:', event.detail.value)
  }
</script>

<List {items} {fields} bind:value={selectedItem} onselect={handleSelect} searchable={true}>
  {#snippet child(item, selected)}
    <div class:selected>
      <strong>{item.get('label')}</strong>
      {#if item.get('description')}
        <p>{item.get('description')}</p>
      {/if}
    </div>
  {/snippet}
</List>
```

#### Props

| Prop                | Type      | Default       | Description                                        |
| ------------------- | --------- | ------------- | -------------------------------------------------- |
| `items`             | `Array`   | `[]`          | Array of data items to display in the list         |
| `fields`            | `Object`  | `{}`          | Field mappings for id, label, and other properties |
| `value`             | `Any`     | `null`        | Selected item (bindable)                           |
| `tabindex`          | `Number`  | `0`           | Tab index for focusing the list                    |
| `searchable`        | `Boolean` | `false`       | Whether to show search input                       |
| `searchPlaceholder` | `String`  | `'Search...'` | Placeholder text for search input                  |
| `class`             | `String`  | `''`          | Additional CSS class names                         |
| `child`             | `Snippet` | `undefined`   | Custom rendering for list items                    |
| `empty`             | `Snippet` | `undefined`   | Custom rendering for empty state                   |

#### Events

| Event    | Detail          | Description                    |
| -------- | --------------- | ------------------------------ |
| `select` | `{ value, id }` | Fired when an item is selected |

## Field Mappings

Field mappings allow you to use the component with any data structure. The component uses the `@rokkit/states` Proxy class to extract the correct data from your items.

```js
const fields = {
  id: 'user_id', // Field to use for unique identifier
  label: 'user_name' // Field to use for display text
  // Add any other fields you need to map
}
```

When using the child snippet, the item passed is a Proxy instance, so you need to use the `get()` method to access fields:

```svelte
{#snippet child(item, selected)}
  <div>
    <!-- Use item.get() to access mapped fields -->
    <span>{item.get('label')}</span>
    <span>{item.get('description')}</span>

    <!-- You can also access any custom fields you've defined -->
    <span>{item.get('customField')}</span>
  </div>
{/snippet}
```

## License

MIT
