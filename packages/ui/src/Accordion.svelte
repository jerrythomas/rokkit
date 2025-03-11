<script>
	import { equals } from 'ramda'
	import { createEmitter, noop, getKeyFromPath } from '@rokkit/core'
	import { DataWrapper } from '@rokkit/states'
	import { navigator } from '@rokkit/actions'
	import { defaultMapping } from './constants'
	import Summary from './Summary.svelte'

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
		mapping = defaultMapping,
		autoCloseSiblings = false,
		multiselect = false,
		value = $bindable(null),
		...events
	} = $props()

	let emitter = $derived(
		createEmitter(events, ['collapse', 'change', 'expand', 'click', 'select', 'move'])
	)
	let wrapper = new DataWrapper(items, mapping, value, { events, multiselect, autoCloseSiblings })
</script>

{#snippet listItems(items, wrapper, hierarchy = [], onchange = noop)}
	{@const mapping = wrapper.mapping}
	{#each items as item, index}
		{@const Template = mapping.getComponent(item)}
		{@const path = getKeyFromPath([...hierarchy, index])}
		{@const props = mapping.getAttribute(item, 'props') || {}}
		<rk-list-item
			role="option"
			data-path={path}
			aria-selected={wrapper.selected.has(path)}
			aria-current={equals(wrapper.currentNode, item)}
		>
			<Template bind:value={items[index]} {mapping} onchange={events.change} {...props} />
		</rk-list-item>
	{/each}
{/snippet}
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<rk-accordion
	class={classes}
	tabindex="0"
	use:navigator={{ wrapper }}
	onactivate={() => (value = wrapper.value)}
>
	{#each wrapper.data as item, index}
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
					{@render listItems(item[mapping.fields.children], wrapper, [index], events.change)}
				</rk-list>
			{/if}
		</div>
	{/each}
</rk-accordion>
