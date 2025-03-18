<script>
	import { createEmitter, noop, getKeyFromPath, getSnippet } from '@rokkit/core'
	// import { defaultMapping } from './constants'
	// import { DataWrapper } from '@rokkit/states'
	import { navigator } from '@rokkit/actions'
	import Item from './Item.svelte'
	import { ListProxy } from '@rokkit/states'
	import { omit } from 'ramda'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {string} [name]
	 * @property {any} [items]
	 * @property {import('@rokkit/core').FieldMapping} [fields]
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
		fields,
		tabindex = 0,
		hierarchy = [],
		multiSelect = false,
		header,
		footer,
		empty,
		...events
	} = $props()

	function handleAction(event) {
		value = wrapper.currentNode.value
		if (event.details.type) {
			emitter[event.details.type](event.details.data)
		}
	}

	let emitter = createEmitter(events, ['select', 'change', 'move'])
	let extra = omit(['onselect', 'onchange', 'onmove'], events)
	let wrapper = new ListProxy(items, value, fields, { multiSelect })
</script>

<rk-list
	class={classes}
	role="listbox"
	aria-label={name}
	use:navigator={{ wrapper }}
	{tabindex}
	onaction={handleAction}
>
	{#if header}
		<rk-header>{@render header()}</rk-header>
	{/if}
	<rk-body>
		{#if wrapper.nodes.length === 0}
			<rk-list-item role="presentation">
				{#if empty}
					{@render empty()}
				{:else}
					No items found.
				{/if}
			</rk-list-item>
		{:else}
			{#each wrapper.nodes as node}
				{@const template = getSnippet(extra, node.get('component'))}
				{@const path = getKeyFromPath(node.path)}
				{@const props = node.get('props') || {}}
				<rk-list-item
					role="option"
					data-path={path}
					aria-selected={node.selected}
					aria-current={node.focused}
				>
					{#if template}
						{@render template(node, props, emitter.change)}
					{:else}
						<Item value={node.value} fields={node.fields} />
					{/if}
				</rk-list-item>
			{/each}
		{/if}
	</rk-body>
	{#if footer}
		<rk-footer>{@render footer()}</rk-footer>
	{/if}
</rk-list>
