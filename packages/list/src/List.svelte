<script>
	// import ListActions from './ListActions.svelte'
	import ListItems from './ListItems.svelte'

	export let items = []
	export let fields = {}
	export let using = {}
	export let activeItem = null
	export let searchable = false
	// export let editable = false

	let search
	let filtered
	function addItem() {
		items = [...items, {}]
		activeItem = items[items.length - 1]
	}
	function deleteSelection() {
		if (activeItem) activeItem.isDeleted = true
	}
	function clearSelection() {
		activeItem = null
	}

	$: filtered = items //items.filter((item) => item[fields.text].includes(search))
</script>

<list class={$$restProps.class}>
	{#if searchable}
		<search>
			<input
				type="search"
				bind:value={search}
				class="rounded-full px-3 leading-loose"
				placeholder="search"
			/>
		</search>
	{/if}
	<!-- {#if editable}
		<ListActions
			on:delete={deleteSelection}
			on:clear={clearSelection}
			on:add={addItem}
		/>
	{/if} -->
	<scroll class="flex flex-col h-full overflow-scroll">
		<ListItems bind:items={filtered} {fields} {using} {activeItem} />
	</scroll>
</list>
