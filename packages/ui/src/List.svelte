<script>
	import { createEmitter } from '@rokkit/core'
	import { navigator } from '@rokkit/actions'
	import ListBody from './ListBody.svelte'
	import { ListController } from '@rokkit/states'
	import { omit, has } from 'ramda'

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
		onselect,
		onchange,
		onmove,
		...snippets
	} = $props()

	let selected = $state([])

	function handleAction(event) {
		const { name, data } = event.detail

		if (has(name, emitter)) {
			value = data.value
			selected = data.selected
			emitter[name](data)
		}
	}

	let emitter = createEmitter({ onchange, onmove, onselect }, ['select', 'change', 'move'])
	let wrapper = new ListController(items, value, fields, { multiSelect })
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
		{#if items.length === 0}
			{#if empty}
				{@render empty()}
			{:else}
				<rk-message>No items found.</rk-message>
			{/if}
		{:else}
			<ListBody
				bind:items
				bind:value
				{fields}
				selectedKeys={wrapper.selectedKeys}
				focusedKey={wrapper.focusedKey}
				onchange={emitter.change}
				{snippets}
			/>
		{/if}
	</rk-body>
	{#if footer}
		<rk-footer>{@render footer()}</rk-footer>
	{/if}
</rk-list>
