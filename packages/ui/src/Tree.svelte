<script>
	import { createEmitter, defaultFields } from '@rokkit/core'
	import { navigator } from '@rokkit/actions'
	import NestedList from './NestedList.svelte'
	import { NestedController } from '@rokkit/states'
	import { omit, has } from 'ramda'
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {Array<any>} [items]
	 * @property {any} [value]
	 * @property {import('@rokkit/core').FieldMapping} [mapping]
	 * @property {import('./types').NodeStateIcons|Object} [icons]
	 * @property {boolean} [autoCloseSiblings=false]
	 * @property {boolean} [multiselect=false]
	 * @property {Function} [header]
	 * @property {Function} [footer]
	 * @property {Function} [empty]
	 * @property {Function} [stub]
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
		header,
		footer,
		empty,
		stub,
		...events
	} = $props()

	let emitter = createEmitter(events, ['select', 'move', 'toggle'])
	let wrapper = new NestedController(items, value, fields, { autoCloseSiblings, multiselect })
	let snippets = omit(['onselect', 'onmove', 'ontoggle'], events)
	let derivedFields = $derived({ ...defaultFields, ...fields })

	function handleAction(event) {
		const { name, data } = event.detail
		if (name === 'select') value = data.value
		if (has([name], emitter)) emitter[name](data)
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<rk-tree
	tabindex="0"
	class={classes}
	use:navigator={{ wrapper, nested: true }}
	onaction={handleAction}
>
	{#if header}
		<rk-header>{@render header()}</rk-header>
	{/if}
	{#if items.length === 0}
		{#if empty}
			{@render empty()}
		{:else}
			<div class="m-auto p-4 text-center text-gray-500">No data available</div>
		{/if}
	{/if}
	<NestedList
		{items}
		fields={derivedFields}
		{value}
		{icons}
		focusedKey={wrapper.currentKey}
		selectedKeys={wrapper.selectedKeys}
		{stub}
		{snippets}
	/>
	{#if footer}
		<rk-footer>{@render footer()}</rk-footer>
	{/if}
</rk-tree>
