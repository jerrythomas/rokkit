<script>
	import { equals } from 'ramda'
	import { createEmitter, noop, getKeyFromPath, getSnippet } from '@rokkit/core'
	import { NestedController } from '@rokkit/states'
	import { navigator } from '@rokkit/actions'
	import Summary from './Summary.svelte'
	import Item from './Item.svelte'
	import ListBody from './ListBody.svelte'

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
		stub = null,
		extra,
		...events
	} = $props()

	let emitter = $derived(
		createEmitter(events, ['collapse', 'change', 'expand', 'click', 'select', 'move'])
	)
	let wrapper = new NestedController(items, value, fields, {
		events,
		multiselect,
		autoCloseSiblings
	})
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<rk-accordion
	class={classes}
	tabindex="0"
	use:navigator={{ wrapper }}
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
	{#each items as item, index}
		{@const key = `${index}`}
		<div
			class="flex flex-col"
			class:is-expanded={wrapper.expandedKeys.has(key)}
			class:is-selected={wrapper.selectedKeys.has(key)}
			data-path={index}
		>
			<Summary
				bind:value={items[index]}
				{fields}
				expanded={wrapper.expandedKeys.has(key)}
				hasChildren={wrapper.hasChildren(key)}
			/>
			{#if wrapper.expandedKeys.has(key)}
				<rk-list role="listbox" tabindex="-1">
					<ListBody
						bind:items={items[fields.children]}
						bind:value
						fields={fields.fields ?? fields}
						{selected}
						{stub}
						onchange={emitter.change}
						{extra}
					/>
				</rk-list>
			{/if}
		</div>
	{/each}
	{#if footer}
		<rk-footer>{@render footer()}</rk-footer>
	{/if}
</rk-accordion>
