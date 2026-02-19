<script>
	import { createEmitter } from '@rokkit/core'
	import { navigator } from '@rokkit/actions'
	import { messages } from '@rokkit/states'
	import ListBody from './ListBody.svelte'
	import { ListController } from '@rokkit/states'
	import { has } from 'ramda'

	/** @type {import('./types.js').ListProps} */
	let {
		class: classes = '',
		name = 'list',
		items = $bindable([]),
		value = $bindable(null),
		fields = {},
		tabindex = 0,
		hierarchy = [],
		multiSelect = false,
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

	let emitter = $derived(
		createEmitter({ onchange, onmove, onselect }, ['select', 'change', 'move'])
	)
	let wrapper = new ListController(items, value, fields, { multiSelect })
</script>

<div
	data-list
	class={classes}
	role="listbox"
	aria-label={name}
	use:navigator={{ wrapper }}
	{tabindex}
	onaction={handleAction}
>
	{#if items.length === 0}
		<div data-list-empty>
			{#if empty}
				{@render empty()}
			{:else}
				<p>{messages.current.emptyList}</p>
			{/if}
		</div>
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
</div>
