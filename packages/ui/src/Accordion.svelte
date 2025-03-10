<script>
	import { equals } from 'ramda'
	import { createEmitter } from '@rokkit/core'
	import { defaultMapping } from './constants'
	import Summary from './Summary.svelte'
	// import { listItems } from './snippets.svelte'

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
		class: classes = '',
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
	}
</script>

{#snippet listItems(items, mapping, value, hierarchy = [], onchange = noop)}
	{#each items as item, index}
		{@const Template = mapping.getComponent(item)}
		{@const path = getKeyFromPath([...hierarchy, index])}
		{@const props = mapping.getAttribute(item, 'props') || {}}
		<rk-list-item
			role="option"
			data-path={path}
			aria-selected={equals(value, item)}
			aria-current={equals(value, item)}
		>
			<Template bind:value={items[index]} {mapping} {onchange} {...props} />
		</rk-list-item>
	{/each}
{/snippet}
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<rk-accordion
	class={classes}
	tabindex="0"
	onselect={handle}
	onmove={handle}
	onexpand={handle}
	oncollapse={handle}
>
	{#each items as item, index}
		{@const hasItems = mapping.hasChildren(item)}
		{@const id = 'id-' + index}

		<div
			{id}
			class="flex flex-col"
			class:is-expanded={mapping.isExpanded(item)}
			class:is-selected={equals(item, value)}
			data-path={index}
		>
			<Summary {mapping} bind:value={items[index]} expanded={mapping.isExpanded(item)} />
			{#if hasItems && mapping.isExpanded(item)}
				<rk-list role="listbox" tabindex="-1">
					{@render listItems(items, mapping, hierarchy, onchange)}
					<!-- <ListItems
						bind:items={items[index][mapping.fields.children]}
						bind:value
						{mapping}
						hierarchy={[index]}
						on:change
					/> -->
				</rk-list>
			{/if}
		</div>
	{/each}
</rk-accordion>
