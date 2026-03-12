# @rokkit/actions

Svelte actions and DOM utilities for Rokkit components.

## Installation

```bash
npm install @rokkit/actions
# or
bun add @rokkit/actions
```

## Overview

`@rokkit/actions` provides the DOM event layer that `@rokkit/ui` components build on. The main export is `Navigator` — a class that wires keyboard, click, and focus events on a container element to a `Wrapper` or `ListController` instance. The package also includes standalone Svelte `use:` actions for effects like ripple, magnetic snap, reveal animations, dismissal on click-outside, and declarative keyboard shortcuts.

## Usage

### navigator — keyboard and click navigation

The `navigator` action connects a container element's DOM events to a Wrapper controller. It handles `ArrowUp`/`ArrowDown`/`ArrowLeft`/`ArrowRight`, `Home`, `End`, `Enter`, `Space`, typeahead, and click-to-select.

```svelte
<script>
  import { navigator } from '@rokkit/actions'
  import { ProxyTree, Wrapper } from '@rokkit/states'

  const tree = new ProxyTree(items)
  const wrapper = new Wrapper(tree, { onselect })
</script>

<ul use:navigator={{ controller: wrapper, orientation: 'vertical' }}>
  {#each wrapper.flatView as node (node.key)}
    <li data-path={node.key}>{node.proxy.label}</li>
  {/each}
</ul>
```

The `data-path` attribute on each item is required — Navigator uses it to resolve which item was clicked or focused.

### Navigator class (imperative usage)

```js
import { Navigator } from '@rokkit/actions'

const nav = new Navigator(containerEl, wrapper, {
  orientation: 'vertical',  // 'vertical' | 'horizontal'
  collapsible: true          // enable expand/collapse key handling
})

// Clean up when done
nav.destroy()
```

### keyboard — declarative shortcut binding

```svelte
<script>
  import { keyboard } from '@rokkit/actions'
</script>

<div use:keyboard={{ submit: 'enter', cancel: 'escape' }}
     onsubmit={() => save()}
     oncancel={() => close()}>
  ...
</div>
```

Default mappings: alphabet keys dispatch `add`, Enter dispatches `submit`, Escape dispatches `cancel`, Backspace/Delete dispatch `delete`.

### ripple — click ripple effect

```svelte
<script>
  import { ripple } from '@rokkit/actions'
</script>

<button use:ripple>Click me</button>

<!-- With options -->
<button use:ripple={{ color: 'white', opacity: 0.2, duration: 400 }}>Click me</button>
```

### hoverLift — elevation shadow on hover

```svelte
<script>
  import { hoverLift } from '@rokkit/actions'
</script>

<div use:hoverLift>Card content</div>
```

### magnetic — snap-to-cursor effect

```svelte
<script>
  import { magnetic } from '@rokkit/actions'
</script>

<button use:magnetic>Hover me</button>
```

### reveal — intersection observer reveal animation

```svelte
<script>
  import { reveal } from '@rokkit/actions'
</script>

<section use:reveal>Fades in when scrolled into view</section>
```

### dismissable — click-outside dismissal

```svelte
<script>
  import { dismissable } from '@rokkit/actions'

  let open = $state(false)
</script>

<div use:dismissable={{ enabled: open, ondismiss: () => (open = false) }}>
  Dropdown content
</div>
```

### swipeable — touch swipe detection

```svelte
<script>
  import { swipeable } from '@rokkit/actions'
</script>

<div use:swipeable onswipeleft={() => next()} onswiperight={() => prev()}>
  Swipeable content
</div>
```

### themable — apply theme CSS variables

```svelte
<script>
  import { themable } from '@rokkit/actions'
</script>

<div use:themable={{ theme: 'ocean' }}>Themed content</div>
```

## API Reference

### Navigator options

| Option | Type | Default | Description |
|---|---|---|---|
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Arrow key axis for prev/next movement |
| `collapsible` | `boolean` | `false` | Enable expand/collapse via arrow keys |

### buildKeymap / resolveAction

Low-level utilities for constructing custom keymaps:

```js
import { buildKeymap, resolveAction, ACTIONS } from '@rokkit/actions'

const keymap = buildKeymap({ orientation: 'vertical', collapsible: true })
const action = resolveAction(keymap, event)  // returns action string or null
```

## Exports

| Export | Type | Description |
|---|---|---|
| `Navigator` | Class | DOM event wiring for Wrapper/ListController |
| `navigator` | Svelte action | `use:navigator` wrapper around Navigator class |
| `keyboard` | Svelte action | Declarative keyboard shortcut binding |
| `ripple` | Svelte action | Material Design ink ripple on click |
| `hoverLift` | Svelte action | Elevation shadow on hover |
| `magnetic` | Svelte action | Snap-to-cursor magnetic effect |
| `reveal` | Svelte action | Intersection-observer reveal animation |
| `dismissable` | Svelte action | Click-outside dismissal |
| `pannable` | Svelte action | Pan / drag detection |
| `swipeable` | Svelte action | Touch swipe detection |
| `themable` | Svelte action | Apply theme CSS vars to element |
| `buildKeymap` | Function | Build a keymap for given orientation/options |
| `resolveAction` | Function | Resolve a keyboard event to an action string |
| `ACTIONS` | Object | Named action constants |

---

Part of [Rokkit](https://github.com/jerrythomas/rokkit) — a Svelte 5 component library and design system.
