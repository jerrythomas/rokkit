<script>
	import { Text, Summary } from './items'
	import { defaultFields } from './constants'
	import ListItems from './ListItems.svelte'

	let className = ''
	export { className as class }
	export let items = []
	export let fields = {}
	export let using = {}
	export let autoClose = false
	export let value = null

	let activeGroup = null

	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Text, ...using }

	function handleToggle(event) {
		if (autoClose) {
			if (
				activeGroup &&
				activeGroup !== event.detail &&
				activeGroup[fields.isOpen]
			) {
				activeGroup[fields.isOpen] = false
			}
			activeGroup = event.detail
		}
	}
</script>

<accordion class="flex flex-col w-full select-none {className}">
	{#each items as item}
		{@const hasItems = item[fields.data] && item[fields.data].length > 0}
		{@const itemFields = fields.fields ?? fields}

		<details class="flex flex-col" class:expanded={item[fields.isOpen]}>
			<Summary {fields} {using} bind:content={item} on:toggle={handleToggle} />
			{#if hasItems && item[fields.isOpen]}
				<ListItems
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
