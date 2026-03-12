# @rokkit/states

Reactive state management for Rokkit UI components — ProxyItem, ProxyTree, Wrapper, ListController.

## Installation

```bash
npm install @rokkit/states
# or
bun add @rokkit/states
```

## Overview

`@rokkit/states` provides the reactive data layer that drives `@rokkit/ui` components. It includes:

- **ProxyItem / ProxyTree** — normalize arbitrary data objects into a unified, field-mapped interface for rendering
- **Wrapper** — navigation controller for persistent components (List, Tree, Tabs). Owns focus, movement, selection, and expansion state
- **ListController** — lower-level reactive base for selection and expansion state
- **Utilities** — i18n messages, theme mode tracking, media query breakpoints

These classes are used internally by `@rokkit/ui` components. You can also use them directly to build custom components or drive navigation logic outside of the standard components.

## Usage

### ProxyItem — normalize any data object

```js
import { ProxyItem } from '@rokkit/states'

const item = { name: 'Dashboard', path: '/dashboard', icon: 'i-solar:home' }
const fields = { label: 'name', value: 'path' }

const proxy = new ProxyItem(item, fields)

proxy.label     // 'Dashboard'
proxy.value     // '/dashboard'
proxy.get('icon')  // 'i-solar:home'
proxy.selected  // reactive boolean ($state)
proxy.disabled  // boolean
proxy.children  // child ProxyItems (if item has children)
```

### ProxyTree — build a navigable tree from nested data

```js
import { ProxyTree } from '@rokkit/states'

const items = [
  { label: 'Section A', children: [
    { label: 'Item 1', value: '1' },
    { label: 'Item 2', value: '2' }
  ]},
  { label: 'Item 3', value: '3' }
]

const tree = new ProxyTree(items)
tree.flatView  // flat array of visible nodes for rendering
tree.lookup    // Map<pathKey, ProxyItem>
```

### Wrapper — navigation controller for persistent components

```js
import { ProxyTree, Wrapper } from '@rokkit/states'

const tree = new ProxyTree(items)
const wrapper = new Wrapper(tree, {
  onselect: (value, item) => console.log('selected', value),
  onchange: (value) => console.log('changed', value)
})

wrapper.flatView         // flat array of visible nodes
wrapper.focusedKey       // currently focused path key (reactive)

wrapper.next()           // move focus down
wrapper.prev()           // move focus up
wrapper.first()          // jump to first item
wrapper.last()           // jump to last item
wrapper.select(pathKey)  // select item by path key
wrapper.expand(pathKey)  // expand a group node
wrapper.collapse(pathKey)
wrapper.moveToValue(value)  // sync focus to match an external value
```

### ListController — base reactive state

```js
import { ListController } from '@rokkit/states'

const ctrl = new ListController()

ctrl.selectedKeys   // SvelteSet of selected path keys
ctrl.expandedKeys   // SvelteSet of expanded path keys
ctrl.focusedKey     // currently focused key
ctrl.data           // flat array of visible nodes
```

### vibe — reactive theme mode

```js
import { vibe } from '@rokkit/states'

vibe.mode          // 'light' | 'dark'
vibe.toggle()      // switch between light and dark
```

### messages — i18n message store

```js
import { messages } from '@rokkit/states'

messages.setLocale('fr')
messages.get('no_results')  // localized string
```

### watchMedia — responsive breakpoints

```js
import { watchMedia, defaultBreakpoints } from '@rokkit/states'

const media = watchMedia(defaultBreakpoints)
media.sm   // reactive boolean — true when viewport matches 'sm'
media.lg   // reactive boolean
```

## API Reference

### ProxyItem

| Member | Type | Description |
|---|---|---|
| `label` | `string` | Display text (field-mapped) |
| `value` | `any` | Selection value (field-mapped) |
| `get(field)` | `any` | Read any field-mapped attribute |
| `expanded` | `boolean` | Reactive expansion state |
| `selected` | `boolean` | Reactive selection state |
| `disabled` | `boolean` | Whether the item is non-interactive |
| `children` | `ProxyItem[]` | Child items |

### Wrapper

| Member | Type | Description |
|---|---|---|
| `flatView` | `Node[]` | Flat array of visible nodes for rendering |
| `focusedKey` | `string \| null` | Currently focused path key |
| `next()` | `void` | Move focus to next navigable item |
| `prev()` | `void` | Move focus to previous navigable item |
| `first()` | `void` | Move focus to first item |
| `last()` | `void` | Move focus to last item |
| `select(key)` | `void` | Select item by path key |
| `expand(key)` | `boolean` | Expand a group; returns false if already expanded or leaf |
| `collapse(key)` | `void` | Collapse a group or move focus to parent |
| `moveToValue(value)` | `void` | Sync focus to match an external bound value |

---

Part of [Rokkit](https://github.com/jerrythomas/rokkit) — a Svelte 5 component library and design system.
