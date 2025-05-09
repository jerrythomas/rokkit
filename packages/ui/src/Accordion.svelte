<script>
	import { equals } from 'ramda'
	import {
		createEmitter,
		noop,
		getKeyFromPath,
		getSnippet,
		defaultFields,
		hasChildren
	} from '@rokkit/core'
	import { NestedController } from '@rokkit/states'
	import { navigator } from '@rokkit/actions'
	import Summary from './Summary.svelte'
	import Item from './Item.svelte'
	import ListBody from './ListBody.svelte'

	const eventNames = ['collapse', 'change', 'expand', 'click', 'select', 'move']
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [items]
	 * @property {import('@rokkit/core').FieldMapper} [mapping]
	 * @property {boolean} [autoCloseSiblings]
	 * @property {boolean} [multiselect]
	 * @property {any} [value]
	 */

	/** @type {Props} */
	let {
		class: classes = '',
		items = $bindable([]),
		value = $bindable(null),
		fields,
		autoCloseSiblings = false,
		multiselect = false,
		header = null,
		footer = null,
		empty = null,
		oncollapse,
		onexpand,
		onchange,
		onselect,
		onmove,
		...snippets
	} = $props()

	let emitter = $derived(
		createEmitter({ oncollapse, onexpand, onchange, onselect, onmove }, eventNames)
	)
	function handleAction(event) {
		const { name, data } = event.detail

		if (has(name, emitter)) {
			value = data.value
			selected = data.selected
			emitter[name](data)
		}
	}

	let wrapper = new NestedController(items, value, fields, {
		multiselect,
		autoCloseSiblings
	})
	let derivedFields = $derived({ ...defaultFields, ...fields })
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<rk-accordion
	class={classes}
	tabindex="0"
	use:navigator={{ wrapper, nested: true }}
	onactivate={() => (value = wrapper.value)}
>
	{#if header}
		<rk-header>{@render header()}</rk-header>
	{/if}
	{#if items.length === 0}
		<rk-list-item role="presentation">
			{#if empty}
				{@render empty()}
			{:else}
				No items found.
			{/if}
		</rk-list-item>
	{/if}
	{#each items as item, index (index)}
		{@const key = `${index}`}
		{@const expanded = item[derivedFields.expanded]}
		<div
			class="flex flex-col"
			class:is-expanded={expanded}
			class:is-selected={wrapper.selectedKeys.has(key)}
			data-path={index}
		>
			<Summary
				bind:value={items[index]}
				{fields}
				{expanded}
				hasChildren={hasChildren(item, derivedFields)}
			/>
			{#if expanded}
				<rk-list role="listbox" tabindex="-1">
					<ListBody
						bind:items={items[fields.children]}
						bind:value
						fields={fields.fields ?? fields}
						{selected}
						onchange={emitter.change}
						{snippets}
					/>
				</rk-list>
			{/if}
		</div>
	{/each}
	{#if footer}
		<rk-footer>{@render footer()}</rk-footer>
	{/if}
</rk-accordion>
