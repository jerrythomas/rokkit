<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from '@rokkit/core'
	import { navigator } from '@rokkit/actions'
	import { Item, Summary } from '@rokkit/molecules'
	// import List from './List.svelte'
	import ListItems from './ListItems.svelte'

	const dispatch = createEventDispatcher()
	let className = ''
	export { className as class }
	export let items = []
	export let fields = {}
	export let using = {}
	export let autoClose = false
	export let value = null
	let cursor = []

	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Item, ...using }

	function handle(event) {
		value = event.detail.node
		cursor = event.detail.path
		if (['collapse', 'expand'].includes(event.type)) {
			if (autoClose) {
				items.map((x) => {
					if (x !== value && x[fields.isOpen]) {
						x[fields.isOpen] = false
					}
				})
			}
			items = items
		}
		dispatch(event.type, event.detail)
	}
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<accordion
	class="flex flex-col w-full select-none {className}"
	tabindex="0"
	use:navigator={{
		items,
		fields,
		enabled: true,
		indices: cursor
	}}
	on:select={handle}
	on:move={handle}
	on:expand={handle}
	on:collapse={handle}
>
	{#each items as item, index}
		{@const hasItems = item[fields.children] && item[fields.children].length > 0}
		{@const itemFields = { ...fields, ...(fields.fields ?? fields) }}

		<div
			id={'id-' + index}
			class="flex flex-col"
			class:is-expanded={item[fields.isOpen]}
			class:is-selected={item === value}
			data-path={index}
		>
			<Summary {fields} {using} bind:value={item} />
			{#if hasItems && item[fields.isOpen]}
				<list class="flex flex-col w-full flex-shrink-0 select-none" role="listbox" tabindex="-1">
					<ListItems
						bind:items={item[fields.children]}
						bind:value
						fields={itemFields}
						{using}
						hierarchy={[index]}
						on:change
					/>
				</list>
				<!-- <List
					bind:items={item[fields.children]}
					bind:value
					fields={itemFields}
					{using}
					on:select
					hierarchy={[index]}
					tabindex="-1"
				/> -->
			{/if}
		</div>
	{/each}
</accordion>
