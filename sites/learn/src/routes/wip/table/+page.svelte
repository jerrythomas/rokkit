<script>
	import Table from './Table.svelte'
	export let data
	$: columns = data.columns
</script>

<div class="flex flex-col p-8 gap-4 w-full h-full overflow-auto">
	<Table {columns} data={data.data} striped />
</div>
