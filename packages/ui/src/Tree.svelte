<script>
	import { createEmitter } from '@rokkit/core'
	import { navigator } from '@rokkit/actions'
	// import { DataWrapper } from '@rokkit/states'
	import NestedList from './NestedList.svelte'
	import { NestedProxy } from '@rokkit/states'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {Array<any>} [items]
	 * @property {any} [value]
	 * @property {import('@rokkit/core').FieldMapping} [mapping]
	 * @property {import('./types').NodeStateIcons|Object} [icons]
	 * @property {boolean} [autoCloseSiblings=false]
	 * @property {boolean} [multiselect=false]
	 */

	/** @type {Props & { [key: string]: any }} */
	let {
		class: classes = 'h-full overflow-scroll flex flex-col',
		items = $bindable([]),
		value = $bindable(null),
		fields,
		icons = {},
		autoCloseSiblings = false,
		multiselect = false,
		keys = null,
		header,
		footer,
		empty,
		...events
	} = $props()

	let emitter = createEmitter(events, ['select', 'move', 'collapse', 'expand'])
	let wrapper = new NestedProxy(items, fields, { autoCloseSiblings, multiselect })
	// let wrapper = new DataWrapper(items, mapping, value, {
	// 	events: emitter,
	// 	multiselect,
	// 	autoCloseSiblings,
	// 	keys
	// })

	$effect(() => {
		wrapper.moveToValue(value)
	})
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<rk-tree
	tabindex="0"
	class={classes}
	use:navigator={{ wrapper }}
	onactivate={() => (value = wrapper.value)}
>
	{#if header}
		<rk-header>{@render header()}</rk-header>
	{/if}
	{#if wrapper.nodes.length === 0}
		{#if empty}
			{@render empty()}
		{:else}
			<div class="m-auto p-4 text-center text-gray-500">No data available</div>
		{/if}
	{/if}
	<NestedList items={wrapper.nodes} {value} {icons} />
	{#if footer}
		<rk-footer>{@render footer()}</rk-footer>
	{/if}
</rk-tree>
