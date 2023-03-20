<script>
	import TabItems from './TabItems.svelte'
	import TabItem from './TabItem.svelte'

	let className = ''
	export { className as class }
	export let items = []
	export let fields = {}
	export let title = null
	export let allowAdd = false
	export let allowClose = false
	export let value = items[0]

	function addTab() {
		items = [...items, {}]
		value = items[items.length - 1]
	}
</script>

<tab-view class="flex flex-col w-full flex-grow {className}">
	<tabs class="flex flex-row flex-shrink-0 w-full select-none cursor-pointer">
		{#if title}
			<p>{title}</p>
		{/if}
		<TabItems {items} {fields} {allowClose} bind:value on:close />
		{#if allowAdd}
			<TabItem label="+" on:click={addTab} />
		{/if}
	</tabs>
	<content class="flex flex-col flex-grow"><slot /></content>
</tab-view>
