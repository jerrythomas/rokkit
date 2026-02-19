<script>
	import { createEmitter, defaultFields } from '@rokkit/core'
	import { navigator } from '@rokkit/actions'
	import NestedList from './NestedList.svelte'
	import { NestedController, messages } from '@rokkit/states'
	import { omit, has } from 'ramda'
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {Array<any>} [items]
	 * @property {any} [value]
	 * @property {import('@rokkit/core').FieldMapping} [fields]
	 * @property {import('./types').NodeStateIcons|Object} [icons]
	 * @property {boolean} [autoCloseSiblings=false]
	 * @property {boolean} [multiselect=false]
	 * @property {boolean} [disabled=false]
	 * @property {Function} [empty]
	 * @property {Function} [stub]
	 */

	/** @type {Props & { [key: string]: any }} */
	let {
		class: classes = '',
		items = $bindable([]),
		value = $bindable(null),
		fields,
		icons = {},
		autoCloseSiblings = false,
		multiselect = false,
		disabled = false,
		empty,
		stub,
		...events
	} = $props()

	let emitter = $derived(createEmitter(events, ['select', 'move', 'toggle']))
	// Note: fields, autoCloseSiblings, multiselect are captured at initialization
	// and won't update reactively - this is intentional for controller configuration
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
<div
	data-tree-root
	tabindex={disabled ? -1 : 0}
	class={classes}
	role="tree"
	aria-disabled={disabled}
	data-disabled={disabled}
	use:navigator={{ wrapper, nested: true }}
	onaction={handleAction}
>
	{#if items.length === 0}
		<div data-tree-empty>
			{#if empty}
				{@render empty()}
			{:else}
				{messages.current.emptyTree}
			{/if}
		</div>
	{/if}
	<NestedList
		{items}
		fields={derivedFields}
		{value}
		{icons}
		{disabled}
		focusedKey={wrapper.currentKey}
		selectedKeys={wrapper.selectedKeys}
		{stub}
		{snippets}
	/>
</div>
