<script>
	import ListActions from './ListActions.svelte'
	import ListItems from './ListItems.svelte'

	let className = 'list'
	export { className as class }
	export let items = []
	export let fields = {}
	export let using = {}
	export let value = null
	export let searchable = false
	export let editable = false

	let search
	let filtered

	function addItem() {
		items = [...items, {}]
		value = items[items.length - 1]
	}
	function deleteSelection() {
		if (value) value.isDeleted = true
	}
	function clearSelection() {
		value = null
	}

	$: filtered =
		searchable && search && search.length
			? items.filter((item) => item[fields.text].includes(search))
			: items
</script>

<list class="flex flex-col w-full {className}">
	{#if searchable || editable}
		<ListActions
			bind:search
			{searchable}
			{editable}
			on:delete={deleteSelection}
			on:clear={clearSelection}
			on:add={addItem}
		/>
	{/if}
	<scroll class="flex flex-col h-full overflow-scroll">
		<ListItems bind:items={filtered} {fields} {using} bind:value on:select />
	</scroll>
</list>
