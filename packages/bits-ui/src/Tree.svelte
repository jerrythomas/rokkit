<script>
  import { createEmitter } from '@rokkit/core'
  import { omit, has } from 'ramda'

  // Import composable components
  import * as TreePrimitive from './index.js'
  
  /**
   * @typedef {Object} Props
   * @property {string} [class]
   * @property {Array<any>} [items]
   * @property {any} [value]
   * @property {import('@rokkit/core').FieldMapping} [fields]
   * @property {import('./types').NodeStateIcons|Object} [icons]
   * @property {boolean} [autoCloseSiblings=false]
   * @property {boolean} [multiselect=false]
   * @property {Function} [header]
   * @property {Function} [footer]
   * @property {Function} [empty]
   * @property {Function} [stub]
   */

  /** @type {Props & { [key: string]: any }} */
  let {
    class: classes = 'h-full overflow-scroll flex flex-col',
    items = $bindable([]),
    value = $bindable(null),
    fields,
    icons = {},
    autoCloseSiblings = false,
    multiselect = false,
    header,
    footer,
    empty,
    stub,
    ...events
  } = $props()

  let emitter = createEmitter(events, ['select', 'move', 'toggle'])
  let snippets = omit(['onselect', 'onmove', 'ontoggle'], events)

  function handleSelect(event) {
    value = event.detail.value
    if (has('select', emitter)) emitter.select(event.detail)
  }
  
  function handleToggle(event) {
    if (has('toggle', emitter)) emitter.toggle(event.detail)
  }
  
  function handleMove(event) {
    if (has('move', emitter)) emitter.move(event.detail)
  }
</script>

<TreePrimitive.Root
  {items}
  bind:value
  {fields}
  {icons}
  {autoCloseSiblings}
  {multiselect}
  class={classes}
  on:select={handleSelect}
  on:toggle={handleToggle}
  on:move={handleMove}
  {...snippets}
>
  {#if header}
    <div data-tree-header>
      {@render header()}
    </div>
  {/if}
  
  <TreePrimitive.Viewport>
    {#if items.length === 0}
      <TreePrimitive.Empty>
        {#if empty}
          {@render empty()}
        {/if}
      </TreePrimitive.Empty>
    {:else}
      <TreePrimitive.NodeList>
        {#snippet item(item, level)}
          {#if stub}
            {@render stub(item, level)}
          {:else}
            {item.label || item.text || item.name || 'Unnamed item'}
          {/if}
        {/snippet}
      </TreePrimitive.NodeList>
    {/if}
  </TreePrimitive.Viewport>
  
  {#if footer}
    <div data-tree-footer>
      {@render footer()}
    </div>
  {/if}
</TreePrimitive.Root>