<script>
	import { defaultFields } from '../constants'
	import ListItems from './ListItems.svelte'
	import Collapsible from '../items/Collapsible.svelte'

	let className = ''
	export { className as class }
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

<accordion class="flex flex-col w-full select-none {className}">
	{#each items as item}
		<group class="flex flex-col">
			<svelte:component
				this={using.collapsible}
				bind:content={item}
				{fields}
				on:toggle={handleToggle}
			/>
			{#if item.isOpen}
				<ListItems
					bind:items={item[fields.data]}
					bind:activeItem
					{fields}
					{using}
					on:click
				/>
			{/if}
		</group>
	{/each}
</accordion>
