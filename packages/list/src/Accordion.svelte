<script>
	import { defaultFields } from './constants'
	import List from './List.svelte'
	import Collapsible from './items/Collapsible.svelte'

	export let items = []
	export let fields = {}
	export let using = {}
	export let autoClose = false

	let activeItem = null
	let activeGroup = null

	$: fields = { ...defaultFields, ...fields }
	$: using = { collapsible: Collapsible, ...using }

	function handleToggle(event) {
		if (autoClose) {
			if (activeGroup && activeGroup !== event.detail && activeGroup.isOpen) {
				activeGroup.isOpen = false
			}
			activeGroup = event.detail
		}
	}
</script>

<accordion class="flex flex-col flex-shrink-0 w-full select-none">
	{#each items as item}
		<svelte:component
			this={using.collapsible}
			bind:content={item}
			{fields}
			on:toggle={handleToggle}
		/>
		{#if item.isOpen}
			<List
				bind:items={item[fields.data]}
				bind:activeItem
				{fields}
				{using}
				on:click
			/>
		{/if}
	{/each}
</accordion>
