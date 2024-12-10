<script>
	import { run } from 'svelte/legacy'

	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from '@rokkit/core'
	import { navigator } from '@rokkit/actions'
	import { Item, Summary } from '@rokkit/molecules'
	// import List from './List.svelte'
	import ListItems from './ListItems.svelte'

	const dispatch = createEventDispatcher()

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [items]
	 * @property {any} [fields]
	 * @property {any} [using]
	 * @property {boolean} [autoClose]
	 * @property {any} [value]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		items = $bindable([]),
		fields = $bindable({}),
		using = $bindable({}),
		autoClose = false,
		value = $bindable(null)
	} = $props()
	let cursor = $state([])

	run(() => {
		fields = { ...defaultFields, ...fields }
	})
	run(() => {
		using = { default: Item, ...using }
	})

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

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<accordion
	class="flex w-full select-none flex-col {className}"
	tabindex="0"
	use:navigator={{
		items,
		fields,
		enabled: true,
		indices: cursor
	}}
	onselect={handle}
	onmove={handle}
	onexpand={handle}
	oncollapse={handle}
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
			<Summary {fields} {using} bind:value={items[index]} />
			{#if hasItems && item[fields.isOpen]}
				<list class="flex w-full flex-shrink-0 select-none flex-col" role="listbox" tabindex="-1">
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
