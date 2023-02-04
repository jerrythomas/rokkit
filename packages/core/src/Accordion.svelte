<script>
	import { defaultFields } from './constants'
	import { Text, Summary } from './items'
	import List from './List.svelte'

	let className = ''
	export { className as class }
	export let items = []
	export let fields = {}
	export let using = {}
	export let autoClose = false
	export let value = null
	// let activeGroup = null

	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Text, ...using }
	// $: openGroupForSeleceted(items)

	// function openGroupForSeleceted(items) {
	// 	if (value) {
	// 		let matched = items.find(
	// 			(x) => x[fields.data].findIndex((y) => y == value) > -1
	// 		)
	// 		if (matched) {
	// 			toggle(matched)
	// 			matched[fields.isOpen] = true
	// 			// if (typeof window !== 'undefined') alert(matched)
	// 		}
	// 	}
	// }
	function toggle(item) {
		if (autoClose) {
			// this event is triggered before the state changes
			if (!item[fields.isOpen]) {
				items.map((x) => {
					if (x !== item && x[fields.isOpen]) {
						x[fields.isOpen] = false
					}
				})
			}
			// if (activeGroup && activeGroup !== item && activeGroup[fields.isOpen]) {
			// 	activeGroup[fields.isOpen] = false
			// }
		}
		// activeGroup = item
	}
</script>

<accordion class="flex flex-col w-full select-none {className}">
	{#each items as item}
		{@const hasItems = item[fields.data] && item[fields.data].length > 0}
		{@const itemFields = { ...fields, ...(fields.fields ?? fields) }}

		<details
			class="flex flex-col"
			class:is-expanded={item[fields.isOpen]}
			bind:open={item[fields.isOpen]}
		>
			<Summary
				{fields}
				{using}
				bind:content={item}
				on:click={() => toggle(item)}
			/>

			{#if hasItems && item[fields.isOpen]}
				<List
					bind:items={item[fields.data]}
					bind:value
					fields={itemFields}
					{using}
					on:select
				/>
			{/if}
		</details>
	{/each}
</accordion>
