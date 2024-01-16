<script>
	import { TreeTable, Switch } from '@rokkit/organisms'
	import { writable } from 'svelte/store'

	let visible = writable([])
	export let data
	let value = 'Diff'
	$: visible.set( value === 'Diff' ?
	    data.data.filter(x => x.diff_value === 'some' || x.diff_type === 'some') : data.data)
	$: console.log(value)
	$: console.log($visible)
</script>
<div class="flex flex-col pt-4 w-full h-full overflow-auto">
<Switch bind:value options={['All', 'Diff']} />
<TreeTable data={$visible} columns={data.columns} />
</div>
