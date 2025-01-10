<script>
	import { createEmitter } from '@rokkit/core'
	// import { createEventDispatcher } from 'svelte'
	import { defaultFields } from '@rokkit/core'
	import { navigator } from '@rokkit/actions'
	import { Item, Summary } from '@rokkit/molecules'
	// import List from './List.svelte'
	import ListItems from './ListItems.svelte'

	// const dispatch = createEventDispatcher()

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
		value = $bindable(null),
		...events
	} = $props()
	let cursor = $state([])

	let emitter = $derived(createEmitter(events, ['collapse', 'change', 'expand', 'click']))
	let internalFields = $derived({ ...defaultFields, ...fields })
	let internalUsing = $derived({ default: Item, ...using })

	function handle(event) {
		value = event.detail.node
		cursor = event.detail.path
		if (['collapse', 'expand'].includes(event.type)) {
			if (autoClose) {
				items.map((x) => {
					if (x !== value && x[internalFields.isOpen]) {
						x[internalFields.isOpen] = false
					}
				})
			}
			items = items
		}
		emitter[event.type](event.detail)
		// dispatch(event.type, event.detail)
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<accordion
	class="flex w-full select-none flex-col {className}"
	tabindex="0"
	use:navigator={{
		items,
		fields: internalFields,
		enabled: true,
		indices: cursor
	}}
	onselect={handle}
	onmove={handle}
	onexpand={handle}
	oncollapse={handle}
>
	{#each items as item, index}
		{@const hasItems = item[internalFields.children] && item[internalFields.children].length > 0}
		{@const itemFields = { ...internalFields, ...(internalFields.fields ?? internalFields) }}

		<div
			id={'id-' + index}
			class="flex flex-col"
			class:is-expanded={item[internalFields.isOpen]}
			class:is-selected={item === value}
			data-path={index}
		>
			<Summary fields={internalFields} {using} bind:value={items[index]} />
			{#if hasItems && item[internalFields.isOpen]}
				<list class="flex w-full flex-shrink-0 select-none flex-col" role="listbox" tabindex="-1">
					<ListItems
						bind:items={item[internalFields.children]}
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
