<script>
	import { createEventDispatcher } from 'svelte'

	import { swatch } from '../lib/utils'
	import { clamp } from 'yootils'
	import Symbol from './Symbol.svelte'
	import PatternDefs from './PatternDefs.svelte'

	const dispatch = createEventDispatcher()

	export let label
	export let size = 30
	export let items = []
	export let type = 'square'
	export let pad = 10
	export let columns
	export let rows
	export let limit
	export let start = 0
	export let autoscale = false
	export let interactive = false
	export let activeIndex = -1

	function fill(item) {
		return item.fillUrl || item.fill || item
	}

	function stroke(item) {
		return item.stroke || item
	}

	function swapType(inputType) {
		return inputType === 'square'
			? 'circle'
			: inputType === 'circle'
			? 'square'
			: type
	}

	function click(index) {
		if (interactive) {
			activeIndex = start + index
			dispatch('click', { index: activeIndex, item: items[activeIndex] })
		}
	}

	function forwardEvent(event, index) {
		if (interactive)
			dispatch(event, {
				index: start + index,
				item: items[start + index]
			})
	}

	$: grid = swatch(limit || items.length, size, pad, columns, rows)
	$: data = grid.data.map((item, i) => ({
		...item,
		type: i == activeIndex ? swapType(type) : type
	}))
	$: start = clamp(start, 0, items.length - (limit || 0))
</script>

<div class="flex flex-col leading-loose">
	{#if label}
		<span class="py-2">{label}</span>
	{/if}
	<svg
		viewBox="0 0 {grid.width} {grid.height}"
		width="100%"
		class="cursor-pointer"
	>
		{#if label}
			<title>A swatch with label {label}</title>
		{/if}

		{#each data as { cx, cy, r, type }, i}
			<Symbol
				x={cx}
				y={cy}
				{size}
				fill={fill(items[i + start])}
				stroke={stroke(items[i + start])}
				shape={items[i + start].shape || type}
				thickness={i + start == activeIndex ? 2 : 0.5}
				on:click={click(i + start)}
				on:mouseover={forwardEvent('mouseover', i + start)}
				on:mouseleave={forwardEvent('mouseleave', i + start)}
				on:focus={forwardEvent('focus', i + start)}
			/>
		{/each}
		<PatternDefs patterns={items} />
	</svg>
</div>
