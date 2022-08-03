<script>
	import TabItems from './TabItems.svelte'
	import TabItem from './TabItem.svelte'

	export let items = []
	export let fields = {}
	export let allowAdd = false
	export let allowClose = false
	export let activeItem = items[0]

	function addTab() {
		items = [...items, {}]
		activeItem = items[items.length - 1]
	}
</script>

<tabs class="flex flex-row flex-grow select-none cursor-pointer">
	<TabItems {items} {fields} {allowClose} bind:activeItem on:close />
	{#if allowAdd}
		<TabItem label="+" on:click={addTab} />
	{/if}
</tabs>
