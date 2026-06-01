export const guideContent = `# Utilities

Rokkit's interactivity is built on two composable primitives:
**controllers** (pure state machines with no DOM dependency) and
the **\`navigator\` Svelte action** (which binds a controller to
the DOM and adds keyboard + ARIA handling).

This split is what lets you test interaction logic without a
browser and build your own accessible components by reusing the
same controllers Rokkit uses internally.

## Controllers

A controller owns the **state** of an interactive widget:

- focused / selected item.
- expanded set (for trees, accordions).
- navigation methods (\`moveNext\`, \`movePrevious\`, \`moveTo\`,
  \`moveFirst\`, \`moveLast\`, \`expand\`, \`collapse\`, \`select\`).
- events (\`onmove\`, \`onselect\`, \`onexpand\`).

\`\`\`js
import { ListController } from '@rokkit/states'

const c = new ListController(items)
c.moveFirst()                    // focus first
c.moveNext()                     // focus next
c.select()                       // select focused, fire onselect
c.focusedKey                     // 'k_0'
c.value                          // the selected items' raw value
\`\`\`

\`NestedController\` adds expand / collapse semantics for trees,
with tree-style behaviour built in: \`expand()\` on an
already-expanded group focuses the first child;
\`collapse()\` on a child focuses the parent.

## The \`navigator\` action

\`use:navigator={controller}\` on any container element:

- adds \`keydown\` handlers for arrows / Home / End / Enter /
  Space / Escape / typeahead.
- attaches \`click\` handlers that read \`data-path\` from the
  target's ancestry.
- writes \`aria-activedescendant\` / \`aria-selected\` /
  \`aria-expanded\` to the relevant elements.
- emits \`move\` and \`select\` events you can hook into.

The only contract on the markup side: each interactive row
carries \`data-path={node.key}\`.

## Building your own component

\`\`\`svelte
<script>
  import { ListController } from '@rokkit/states'
  import { navigator } from '@rokkit/actions'

  let { items, value = $bindable() } = $props()
  const c = new ListController(items)
  c.moveToValue(value)

  function handleSelect(v) { value = v }
</script>

<ul use:navigator={c} role="listbox" tabindex="0">
  {#each c.flatView as node (node.key)}
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
\`\`\`

That's a full keyboard-navigable, ARIA-correct list — built on
the same primitives \`<List>\` uses internally.

## ProxyItem and ProxyTree

Controllers don't read your raw rows directly. They wrap each
item in a \`ProxyItem\` that exposes \`label\`, \`value\`,
\`get(field)\`, \`disabled\`, \`children\` — all resolving through
the \`fields\` mapping. Snippets receive these proxies, not your
raw data.

\`\`\`js
import { ProxyItem } from '@rokkit/states'

const proxy = new ProxyItem({ name: 'Alice' }, { label: 'name' })
proxy.label         // 'Alice'
proxy.get('name')   // 'Alice'
\`\`\`

\`ProxyTree\` does the same recursively for hierarchical data.

## Icons

\`@rokkit/icons\` ships a curated UnoCSS icon collection plus the
\`DEFAULT_STATE_ICONS\` map components use internally for state
(opened folder, dismiss x, copy / saved, etc.). Override per
component via the \`icons\` prop, or globally via the unocss
config to swap your own collection in.
`
