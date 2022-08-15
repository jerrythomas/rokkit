<script>
	import { defaultFields } from '../constants'
	import ListItems from './ListItems.svelte'
	import Collapsible from '../items/Collapsible.svelte'

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

<!-- {#if editable}
	<ListActions
		on:delete={deleteSelection}
		on:clear={clearSelection}
		on:add={addItem}
	/>
{/if} -->
<accordion
	class="flex flex-col flex-shrink-0 w-full select-none {$$restProps.class}"
>
	{#each items as item}
		<group>
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
