# @rokkit/ui

Data-driven UI components for Svelte 5 applications.

## Installation

```bash
npm install @rokkit/ui
# or
bun add @rokkit/ui
```

Requires `svelte ^5.0.0` as a peer dependency.

## Overview

`@rokkit/ui` provides 38 components covering forms, dropdowns, lists, navigation, data display, layout, and file upload. Components follow a data-first model: they adapt to your data structures via field mapping rather than requiring data to be reshaped. All components are unstyled by default — they expose `data-*` attribute hooks for theming via `@rokkit/themes`. Keyboard navigation and ARIA accessibility are built in.

## Usage

### List

```svelte
<script>
  import { List } from '@rokkit/ui'

  const items = ['Apple', 'Banana', 'Cherry']
  let selected = $state(null)
</script>

<List {items} bind:value={selected} onselect={(val) => console.log(val)} />
```

### Select with field mapping

When your data keys differ from the expected defaults, use the `fields` prop:

```svelte
<script>
  import { Select } from '@rokkit/ui'

  const countries = [
    { name: 'United States', code: 'us' },
    { name: 'Germany', code: 'de' }
  ]
  let chosen = $state(null)
</script>

<Select options={countries} fields={{ label: 'name', value: 'code' }} bind:value={chosen} />
```

### Tabs with bind:value

```svelte
<script>
  import { Tabs } from '@rokkit/ui'

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Settings', value: 'settings' }
  ]
  let activeTab = $state('overview')
</script>

<Tabs items={tabs} bind:value={activeTab}>
  {#snippet tabPanel(tab)}
    <div>Content for {tab.label}</div>
  {/snippet}
</Tabs>
```

### Button variants

```svelte
<script>
  import { Button } from '@rokkit/ui'
</script>

<Button variant="primary" onclick={() => save()}>Save</Button>
<Button variant="default" onclick={() => cancel()}>Cancel</Button>
<Button href="/docs">Documentation</Button>
```

### Menu

```svelte
<script>
  import { Menu } from '@rokkit/ui'

  const items = [
    { text: 'Copy', value: 'copy' },
    { text: 'Paste', value: 'paste' },
    { text: 'Delete', value: 'delete', disabled: true }
  ]
</script>

<Menu options={items} label="Actions" onselect={(value) => handleAction(value)} />
```

## Components

| Category          | Components                                                     |
| ----------------- | -------------------------------------------------------------- |
| Form / Input      | Button, ButtonGroup, Toggle, Switch, Range, SearchFilter, Tabs |
| Dropdown          | Menu, Select, MultiSelect, Toolbar, ToolbarGroup               |
| List / Navigation | List, Tree, LazyTree, BreadCrumbs                              |
| Layout            | Card, Grid, Carousel, ProgressBar, Timeline                    |
| Data Display      | Table, Rating, Pill, Connector, Stepper                        |
| Visual            | Reveal, Tilt, Shine, Code, ItemContent                         |
| Advanced          | PaletteManager, FloatingAction, FloatingNavigation             |
| Upload            | UploadTarget, UploadFileStatus, UploadProgress                 |

## API

### Standard props

Most components share a consistent interface:

| Prop                    | Description                                                             |
| ----------------------- | ----------------------------------------------------------------------- |
| `items` / `options`     | Array of data items                                                     |
| `value`                 | Bindable selected value                                                 |
| `fields`                | Field mapping — maps component-expected keys to your data's actual keys |
| `onchange` / `onselect` | Selection callback                                                      |

### Field mapping

The `fields` prop lets any data structure work with any component without reshaping:

```js
// Your data has 'name' and 'id' — map them to what the component expects
const fields = { label: 'name', value: 'id' }
```

### Snippet customization

Components accept Svelte 5 snippets for rendering overrides. This lets you customize presentation without forking the component:

```svelte
<List {items}>
  {#snippet itemContent(item)}
    <span class="tag">{item.label}</span>
  {/snippet}
</List>
```

## Exports

```js
import { List, Select, Menu, Button /* ... */ } from '@rokkit/ui'
import type { ListProps, SelectFields } from '@rokkit/ui/types'
import { generatePalette } from '@rokkit/ui/utils/palette'
```

## Theming

Components use `data-*` attribute selectors for styling (e.g., `[data-list-item]`, `[data-button]`). Apply styles via `@rokkit/themes` or write your own CSS targeting these hooks.

---

Part of [Rokkit](https://github.com/jerrythomas/rokkit) — a Svelte 5 component library and design system.
