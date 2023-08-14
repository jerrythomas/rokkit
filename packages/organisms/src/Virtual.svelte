<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from '@rokkit/core'
	import { scrollable } from '@rokkit/actions'
	import { Item } from '@rokkit/molecules'

	const dispatch = createEventDispatcher()

	export let value = null
	export let items = []
	export let fields = {}
	export let size = '100%'
	export let horizontal = false
	export let minSize = 40
	export let limit = null

	export let start = 0
	export let end = limit ? start + limit : 0
	export let tabindex = 0

	let index = null
	let current = null

	function handle(event) {
		current = event.detail.index

		if (event.type === 'select') {
			index = event.detail.index
			value = event.detail.item
			dispatch('select', { index, value })
		} else if (event.type === 'refresh') {
			start = event.detail.start
			end = event.detail.end
		} else {
			dispatch(event.type, event.detail)
		}
	}

	$: visible = items.slice(start, end).map((data, i) => {
		return { index: i + start, data }
	})
	$: fields = { ...defaultFields, ...fields }
	$: listStyle = horizontal ? `width: ${size}` : `height: ${size}`
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<virtual-list-viewport
	use:scrollable={{
		items,
		index: current,
		value,
		start,
		end,
		minSize,
		maxVisible: limit
	}}
	on:refresh={handle}
	on:move={handle}
	style={listStyle}
	class="relative block"
	class:overflow-y-auto={!horizontal}
	class:overflow-x-auto={horizontal}
	{tabindex}
>
	<virtual-list-contents class="block">
		{#each visible as row (row.index)}
			<virtual-list-item
				data-index={row.index}
				aria-selected={index === row.index}
				aria-current={current === row.index}
			>
				<slot item={row.data}>
					<Item value={row.data} {fields} />
				</slot>
			</virtual-list-item>
		{/each}
	</virtual-list-contents>
</virtual-list-viewport>

<style>
	virtual-list-viewport {
		-webkit-overflow-scrolling: touch;
	}
</style>
