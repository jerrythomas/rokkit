<script>
  import { ListController } from '@rokkit/states'
  import { navigator } from '@rokkit/actions'

  const items = [{ id: 1, name: 'Alpha' }, { id: 2, name: 'Beta' }]
  const controller = new ListController()
  controller.setItems(items, { text: 'name', value: 'id' })

  let selected = $state(null)
</script>

<ul use:navigator={{ controller, onselect: (v) => (selected = v) }}>
  {#each items as item, i}
    <li data-path={i}>{item.name}</li>
  {/each}
</ul>
