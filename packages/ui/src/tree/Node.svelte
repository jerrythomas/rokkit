<script>
  import { defaultStateIcons, getKeyFromPath, getSnippet } from '@rokkit/core'
  import Icon from '../Icon.svelte'
  import Connector from '../Connector.svelte'
  import Item from '../Item.svelte'

  /**
   * @typedef {Object} Props
   * @property {any} value
   * @property {import('../types').FieldMapping} fields
   * @property {any[]} types
   * @property {import('../types').NodeStateIcons} stateIcons
   * @property {number[]} path
   * @property {boolean} focused
   * @property {boolean} selected
   * @property {boolean} expanded
   * @property {Function} children
   * @property {Function} stub
   * @property {Object<string, Function>} snippets
   */

  /** @type {Props} */
  let {
    value = $bindable(null),
    fields,
    types = [],
    stateIcons = defaultStateIcons.node,
    path = [],
    focused = false,
    selected = false,
    expanded = false,
    children,
    stub = null,
    snippets = {}
  } = $props()

  let stateName = $derived(expanded ? 'opened' : 'closed')
  let icons = $derived({ ...defaultStateIcons.node, ...stateIcons })
  let state = $derived(
    expanded ? { icon: icons.opened, label: 'collapse' } : { icon: icons.closed, label: 'expand' }
  )

  const template = getSnippet(value[fields.snippet], snippets, stub)
  const isLeaf = !value?.[fields.children] || value[fields.children]?.length === 0
</script>

<div
  data-tree-node
  data-tree-leaf={isLeaf ? true : undefined}
  data-tree-branch={!isLeaf ? true : undefined}
  aria-current={focused}
  aria-selected={selected}
  aria-expanded={expanded}
  role="treeitem"
  data-path={getKeyFromPath(path)}
  data-depth={path.length}
  tabindex="-1"
  class="flex flex-row items-center"
>
  {#each types as type, index (index)}
    {#if type === 'icon'}
      <Icon name={state.icon} label={state.label} state={stateName} class="w-4" size="small" />
    {:else}
      <Connector {type} />
    {/if}
  {/each}
  <div data-tree-content>
    <svelte:boundary>
      {#if template}
        {@render template(value)}
        {#snippet failed()}
          <Item {value} {fields} />
        {/snippet}
      {:else}
        <Item {value} {fields} />
      {/if}
    </svelte:boundary>
  </div>
  {@render children?.()}
</div>
