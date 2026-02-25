<script>
  import { Table, SearchFilter } from '@rokkit/ui'
  import { filterData } from '@rokkit/data'

  let filters = $state([])
  const filtered = $derived(filters.length > 0 ? filterData(data, filters) : data)
</script>

<SearchFilter bind:filters placeholder="e.g. name:alice salary>90000" />
<Table data={filtered} caption="Filtered" />
