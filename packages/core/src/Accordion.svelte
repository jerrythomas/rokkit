<script>
	import { defaultFields } from './constants'
	import { Text, Summary } from './items'
	import List from './List.svelte'
	import { navigable } from './actions'

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

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<accordion class="flex flex-col w-full select-none {className}" tabindex="0">
	{#each items as item}
		{@const hasItems =
			item[fields.children] && item[fields.children].length > 0}
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
					bind:items={item[fields.children]}
					bind:value
					fields={itemFields}
					{using}
					on:select
					tabindex="-1"
				/>
			{/if}
		</details>
	{/each}
</accordion>
