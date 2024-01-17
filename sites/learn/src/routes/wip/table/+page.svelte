<script>
	import { TreeTable, Switch } from '@rokkit/organisms'
	import { writable } from 'svelte/store'

	let visible = writable([])
	export let data
	let value = 'Diff'
	$: visible.set(data.data.filter((x) => value !== 'Diff' || x.value_diff || x.type_diff))
</script>

<div class="flex flex-col p-8 gap-4 w-full h-full overflow-auto">
	<Switch bind:value options={['All', 'Diff']} />
	<TreeTable data={$visible} striped={false} multiselect columns={data.columns} />
</div>
