# @rokkit/core

Core utilities for the Rokkit design system — field mapping, constants, calendar, color palette, and event utilities.

## Install

```sh
npm install @rokkit/core
# or
bun add @rokkit/core
```

## Overview

`@rokkit/core` is the foundation layer shared across all Rokkit packages. It provides:

- **Field mapping** — map arbitrary data object shapes to semantic field names
- **Constants** — `BASE_FIELDS`, `DEFAULT_STATE_ICONS`, `DEFAULT_KEYMAP`, and more
- **Color palette** — default colors, shades, and theme color mapping
- **Calendar utilities** — calendar day generation and weekday labels
- **Event utilities** — lightweight emitter factory
- **Direction detection** — RTL/LTR helpers
- **Tick generation** — axis tick utilities for chart packages

No runtime dependencies on other `@rokkit/*` packages.

## Usage

### Field mapping

`FieldMapper` maps semantic field names (`label`, `value`, `icon`, etc.) to the actual keys present in your data objects. Pass a fields override to adapt any data shape.

```js
import { FieldMapper } from '@rokkit/core'

const mapper = new FieldMapper({ label: 'name', value: 'id', icon: 'iconClass' })

const item = { id: 42, name: 'Settings', iconClass: 'i-settings' }

mapper.get('label', item) // 'Settings'
mapper.get('value', item) // 42
mapper.get('icon', item) // 'i-settings'
```

### normalizeFields

Merge user-supplied field overrides with `BASE_FIELDS` defaults, remapping any legacy key names automatically.

```js
import { normalizeFields, BASE_FIELDS } from '@rokkit/core'

const fields = normalizeFields({ label: 'title', value: 'slug' })
// { label: 'title', value: 'slug', icon: 'icon', children: 'children', ... }
```

### BASE_FIELDS reference

```js
import { BASE_FIELDS } from '@rokkit/core'

// {
//   id: 'id',         value: 'value',       label: 'label',
//   icon: 'icon',     avatar: 'image',       subtext: 'description',
//   tooltip: 'title', badge: 'badge',        shortcut: 'shortcut',
//   children: 'children',  type: 'type',    snippet: 'snippet',
//   href: 'href',     hrefTarget: 'target',
//   disabled: 'disabled',  expanded: 'expanded', selected: 'selected'
// }
```

### Event emitter

```js
import { createEmitter } from '@rokkit/core'

const emitter = createEmitter()
emitter.on('select', (item) => console.log('selected', item))
emitter.emit('select', myItem)
```

### Calendar utilities

```js
import { getCalendarDays, weekdays } from '@rokkit/core'

const days = getCalendarDays(2025, 2) // February 2025
// weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
```

### Tick generation

```js
import { generateTicks } from '@rokkit/core'

const ticks = generateTicks(0, 100, 5)
// [0, 25, 50, 75, 100]
```

## API

| Export                           | Description                                                   |
| -------------------------------- | ------------------------------------------------------------- |
| `BASE_FIELDS`                    | Canonical semantic-to-data-key field mapping                  |
| `normalizeFields(fields)`        | Merge overrides with BASE_FIELDS defaults                     |
| `FieldMapper`                    | Class that resolves semantic field reads from data objects    |
| `DEFAULT_STATE_ICONS`            | Icon name map grouped by category (action, state, sort, etc.) |
| `DEFAULT_KEYMAP`                 | Default keyboard navigation key mapping                       |
| `DEFAULT_THEME_MAPPING`          | Default semantic color → palette color mapping                |
| `createEmitter()`                | Lightweight event emitter factory                             |
| `getCalendarDays(year, month)`   | Calendar day array for a given month                          |
| `weekdays`                       | Localized weekday label array                                 |
| `generateTicks(min, max, count)` | Evenly spaced axis tick values                                |
| `defaultColors`                  | Default color palette array                                   |
| `shades`                         | Available shade scale values                                  |
| `ITEM_SNIPPET`                   | Constant: default item snippet key (`'itemContent'`)          |
| `GROUP_SNIPPET`                  | Constant: default group snippet key (`'groupContent'`)        |
| `stateIconsFromNames(names)`     | Build a state icon map from an array of icon name strings     |

---

Part of [Rokkit](https://github.com/jerrythomas/rokkit) — a Svelte 5 component library and design system.
