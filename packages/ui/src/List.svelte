<script>
	import { createEmitter, noop, getKeyFromPath } from '@rokkit/core'
	import { equals } from 'ramda'
	import { defaultMapping } from './constants'
	// import { listItems } from './snippets.svelte'
	import { onMount } from 'svelte'
	import { DataWrapper } from '@rokkit/states'
	import { navigator } from '@rokkit/actions'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {string} [name]
	 * @property {any} [items]
	 * @property {import('@rokkit/core').FieldMapper} [mapping]
	 * @property {any} [value]
	 * @property {number} [tabindex]
	 * @property {any} [hierarchy]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let {
		class: classes = '',
		name = 'list',
		items = $bindable([]),
		value = $bindable(null),
		mapping = defaultMapping,
		tabindex = 0,
		hierarchy = [],
		children,
		...events
	} = $props()

	let emitter = createEmitter(events, ['select', 'change', 'move'])
	let wrapper = new DataWrapper(items, mapping, value, { events: emitter })
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
			<Template bind:value={items[index]} {mapping} {onchange} {...props} />
		</rk-list-item>
	{/each}
{/snippet}

<rk-list
	class={classes}
	role="listbox"
	aria-label={name}
	use:navigator={{ wrapper }}
	{tabindex}
	onactivate={() => (value = wrapper.value)}
>
	{@render children?.()}
	{@render listItems(wrapper.data, wrapper, hierarchy, emitter.change)}
	<!-- <ListItems bind:items {mapping} {hierarchy} /> -->
</rk-list>
