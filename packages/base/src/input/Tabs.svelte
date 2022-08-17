<script>
	import TabItems from './TabItems.svelte'
	import TabItem from './TabItem.svelte'

	export let items = []
	export let fields = {}
	export let title = null
	export let allowAdd = false
	export let allowClose = false
	export let activeItem = items[0]

	function addTab() {
		items = [...items, {}]
		activeItem = items[items.length - 1]
	}

	$: console.log(activeItem)
</script>

<tab-view class="flex flex-col w-full flex-grow">
	<tabs class="flex flex-row flex-shrink-0 w-full select-none cursor-pointer">
		{#if title}
			<p>{title}</p>
		{/if}
		<TabItems {items} {fields} {allowClose} bind:activeItem on:close />
		{#if allowAdd}
			<TabItem label="+" on:click={addTab} />
		{/if}
	</tabs>
	<content class="flex flex-col flex-grow"><slot /></content>
</tab-view>
