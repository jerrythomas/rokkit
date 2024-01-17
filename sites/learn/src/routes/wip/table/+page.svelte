<script>
	import { TreeTable, Switch } from '@rokkit/organisms'
	import { writable } from 'svelte/store'

	let visible = writable([])
	export let data
	let value = 'Diff'
	$: visible.set( value === 'Diff' ?
	    data.data.filter(x => x.value_diff  || x.type_diff ) : data.data)
</script>
<div class="flex flex-col p-8 gap-4 w-full h-full overflow-auto">
  <Switch bind:value options={['All', 'Diff']} />
  <TreeTable data={$visible} columns={data.columns} />
</div>
