<script>
	// ensure that parent has position: relative.
	// on reaching limit remove mouse events.
	import { createEventDispatcher } from 'svelte'
	import { pannable } from '@rokkit/actions'

	const dispatch = createEventDispatcher()

	export let vertical = false
	export let index
	export let min = 0
	export let max = 100
	export let pos = 50
	export let offset = 0

	let wall

	function clamp(min, max, value) {
		return min > value ? min : max < value ? max : value
	}

	function fixLimits() {
		if (min > max) [min, max] = [max, min]
		max = clamp(0, 100, max)
		min = clamp(0, 100, min)
		pos = clamp(min, max, pos)
	}

	function handlePanMove(event) {
		const { top, bottom, left, right } = wall.parentElement.getBoundingClientRect()
		const extents = horizontal ? [left, right] : [top, bottom]
		let px = clamp(extents[0], extents[1], horizontal ? event.detail.x : event.detail.y)

		pos = clamp(min, max, (100 * (px - extents[0])) / (extents[1] - extents[0]))

		dispatch('change', { pos, index, offset })
	}
	$: fixLimits()
	$: horizontal = !vertical
	$: side = horizontal ? 'left' : 'top'
</script>

<span
	bind:this={wall}
	class="wall"
	class:vertical
	class:horizontal
	use:pannable
	on:panmove={handlePanMove}
	style="{side}: calc({pos}% - 8px)"
/>

<style>
	.wall {
		position: absolute;
		z-index: 10;
	}
	.wall::after {
		content: '';
		position: absolute;
		background-color: #000;
	}
	.wall:hover {
		cursor: ew-resize;
	}
	.horizontal.wall {
		padding: 0 8px;
		width: 0;
		height: 100%;
		cursor: ew-resize;
	}
	.horizontal.wall::after {
		left: 8px;
		top: 0;
		width: 1px;
		height: 100%;
	}
	.vertical.wall {
		padding: 8px 0;
		width: 100%;
		height: 0;
		cursor: ns-resize;
	}
	.vertical.wall::after {
		top: 8px;
		left: 0;
		width: 100%;
		height: 1px;
	}
</style>
