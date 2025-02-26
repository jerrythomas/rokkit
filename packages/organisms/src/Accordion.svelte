<script>
	import { equals } from 'ramda'
	import { createEmitter } from '@rokkit/core'
	import { defaultMapping } from '@rokkit/molecules/constants'
	import { Summary, ListItems } from '@rokkit/molecules'

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
		mapping = defaultMapping,
		autoClose = false,
		value = $bindable(null),
		...events
	} = $props()
	let cursor = $state([])

	let emitter = $derived(createEmitter(events, ['collapse', 'change', 'expand', 'click']))

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
<rk-accordion
	class="flex w-full select-none flex-col {className}"
	tabindex="0"
	onselect={handle}
	onmove={handle}
	onexpand={handle}
	oncollapse={handle}
>
	{#each items as item, index}
		{@const hasItems = mapping.hasChildren(item)}

		<div
			id={'id-' + index}
			class="flex flex-col"
			class:is-expanded={mapping.isExpanded(item)}
			class:is-selected={equals(item, value)}
			data-path={index}
		>
			<Summary {mapping} bind:value={items[index]} />
			{#if hasItems && mapping.isExpanded(item)}
				<rk-list
					class="flex w-full flex-shrink-0 select-none flex-col"
					role="listbox"
					tabindex="-1"
				>
					<ListItems
						bind:items={items[index][mapping.fields.children]}
						bind:value
						{mapping}
						hierarchy={[index]}
						on:change
					/>
				</rk-list>
			{/if}
		</div>
	{/each}
</rk-accordion>
