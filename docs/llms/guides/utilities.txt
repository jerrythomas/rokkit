# Utilities

Rokkit's interactivity is built on three composable primitives:
**ProxyTree** (a reactive data layer), **Wrapper** (a pure state
machine for navigation and selection), and the **`Navigator`
class** (which binds a Wrapper to the DOM and adds keyboard +
ARIA handling).

This split is what lets you test interaction logic without a
browser and build your own accessible components by reusing the
same primitives Rokkit uses internally.

## Wrapper — navigation state

A `Wrapper` owns the **state** of an interactive widget:

- focused / selected item.
- expanded set (for trees, accordions, collapsible groups).
- navigation methods (`next`, `prev`, `first`, `last`,
  `moveTo`, `expand`, `collapse`, `select`, `toggle`,
  `extend`, `range`).
- callbacks (`onselect`, `onchange`).

```js
import { ProxyTree, Wrapper } from '@rokkit/states'

const tree = new ProxyTree(items, fields)
const w = new Wrapper(tree, { onselect, collapsible: true })

w.first(null)                   // focus first navigable item
w.next(null)                    // focus next
w.select(null)                  // select focused, fire onselect
w.focusedKey                    // '0'
w.selected                      // the selected item's value
```

For lazy-loading trees, use `LazyWrapper` — it adds sentinel
detection and on-demand `fetch()` calls.

For tabular data, use `ProxyTable` instead of `ProxyTree` — it
adds columns + sort while keeping the same `flatView`/`lookup`
interface Wrapper consumes.

## The `Navigator` class

Mounted on a container element, `Navigator` binds DOM events
to a Wrapper:

- adds `keydown` handlers for arrows / Home / End / Enter /
  Space / Escape / typeahead / ctrl-Space / shift-Space.
- attaches `click` handlers that read `data-path` from the
  target's ancestry (including ctrl/cmd-click for toggle and
  shift-click for range, when the wrapper opts in to multiselect).
- syncs DOM focus and contains `scrollIntoView` to the root.
- watches `focusin` / `focusout` to redirect focus and call
  `wrapper.blur()` when focus leaves the list.

The only contract on the markup side: each interactive row
carries `data-path={node.key}`.

## Building your own component

```svelte
<script>
  import { ProxyTree, Wrapper } from '@rokkit/states'
  import { Navigator } from '@rokkit/actions'

  let { items, value = $bindable() } = $props()

  const tree = $derived(new ProxyTree(items))
  const w = $derived(new Wrapper(tree, { onselect: (v) => (value = v) }))

  $effect(() => w.moveToValue(value))

  let rootRef = $state(null)
  $effect(() => {
    if (!rootRef) return
    const nav = new Navigator(rootRef, w, { orientation: 'vertical' })
    return () => nav.destroy()
  })
</script>

<ul bind:this={rootRef} role="listbox" tabindex="0">
  {#each w.flatView as node (node.key)}
    <li
      data-path={node.key}
      data-active={node.proxy.value === value || undefined}
      role="option"
      aria-selected={node.proxy.value === value}
    >
      {node.proxy.label}
    </li>
  {/each}
</ul>
```

That's a full keyboard-navigable, ARIA-correct list — built on
the same primitives `<List>` uses internally.

## ProxyItem and ProxyTree

Controllers don't read your raw rows directly. They wrap each
item in a `ProxyItem` that exposes `label`, `value`,
`get(field)`, `disabled`, `children` — all resolving through
the `fields` mapping. Snippets receive these proxies, not your
raw data.

```js
import { ProxyItem } from '@rokkit/states'

const proxy = new ProxyItem({ name: 'Alice' }, { label: 'name' })
proxy.label         // 'Alice'
proxy.get('name')   // 'Alice'
```

`ProxyTree` does the same recursively for hierarchical data.

## Icons

`@rokkit/icons` ships a curated UnoCSS icon collection plus the
`DEFAULT_STATE_ICONS` map components use internally for state
(opened folder, dismiss x, copy / saved, etc.). Override per
component via the `icons` prop, or globally via the unocss
config to swap your own collection in.
