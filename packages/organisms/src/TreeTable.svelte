<script>
  import { pick } from 'ramda'
  import { defaultFields } from '@rokkit/core'
  import { Connector,Icon } from '@rokkit/atoms'
  import { Item } from '@rokkit/molecules'
  export let data = [] // Input array of objects
  export let columns = []

  $: sizes = columns.map(col => col.width ?? '1fr').join(' ')
</script>

<style>
  tr {
    grid-template-columns: var(--sizes);
  }
  tr.even > td {
    @apply bg-neutral-subtle;
  }
  th, td{
    @apply px-4 py-4;
  }
  td :global(icon) {
    @apply text-secondary-700;
  }
</style>
<div class="flex flex-col h-full w-full p-8 overflow-auto" style:--sizes={sizes}>
 <table class="flex flex-col h-full overflow-y-hidden">
  <thead>
    <tr class="grid gap-1px">
      {#each columns as col}
        <th class="bg-neutral-400">{col.label}</th>
      {/each}
    </tr>
  </thead>
  <tbody class="flex flex-col gap-1px overflow-y-auto ">
    {#each data as item, index }
      {@const even = index % 2 === 0}
      <tr class="grid gap-1px" class:even>
        {#each columns as col}
          {@const value = { ...pick(['icon'],col), ...item }}
          {@const fields = {...defaultFields,text:col.key, ...col.fields}}
          <td class="flex gap-2 bg-neutral-muted">
            {#if col.path}
              {#each item._levels.slice(0,-1) as _}
                <Connector type="empty" />
              {/each}
              {#if item._isParent}
              <Icon name={item._isExpanded ? 'node-opened' : 'node-closed'} class="small"/>
              {/if}
            {/if}
            <Item value={value} fields={fields} />
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
</div>