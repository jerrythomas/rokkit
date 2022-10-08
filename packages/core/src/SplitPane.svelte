<script>
	import { createEventDispatcher } from 'svelte'
	import { pannable } from './actions'

	const dispatch = createEventDispatcher()

	export let vertical = false
	export let limits = [50, 30]
	export let pos = 70
	export let styles = ['', '']

	let refs = {}

	function clamp(min, max, value) {
		return min > value ? min : max < value ? max : value
	}

	function handlePanMove(event) {
		const { top, bottom, left, right } = refs.wrapper.getBoundingClientRect()
		const extents = horizontal ? [left, right] : [top, bottom]
		let px = clamp(
			extents[0],
			extents[1],
			horizontal ? event.detail.x : event.detail.y
		)
		pos = clamp(
			limits[0],
			100 - limits[1],
			(100 * (px - extents[0])) / (extents[1] - extents[0])
		)
		dispatch('change', { pos })
	}

	$: horizontal = !vertical
	$: side = horizontal ? 'left' : 'top'
	$: dimension = horizontal ? 'width' : 'height'
	$: direction = vertical ? 'vertical' : 'horizontal'
</script>

<div class="wrapper {direction}" bind:this={refs.wrapper}>
	<div class={styles[0]} style="{dimension}: {pos}%;">
		<slot name="a" />
	</div>
	<div class={styles[1]} style="{dimension}: {100 - pos}%;">
		<slot name="b" />
	</div>
	<span
		class="wall"
		use:pannable
		on:panmove={handlePanMove}
		style="{side}: calc({pos}% - 8px)"
	/>
</div>

<style>
	.wrapper {
		position: relative;
		display: flex;
		height: 100%;
		width: 100%;
	}
	.wrapper div {
		flex: 1 1 auto;
		height: 100%;
	}

	.horizontal {
		flex-direction: row;
	}
	.vertical {
		flex-direction: column;
	}
	.wall {
		position: absolute;
		z-index: 10;
	}
	.wall::after {
		content: '';
		position: absolute;
		background-color: var(--bg-800);
	}
	.wall:hover {
		cursor: ew-resize;
	}
	.horizontal .wall {
		padding: 0 8px;
		width: 0;
		height: 100%;
		cursor: ew-resize;
	}
	.horizontal .wall::after {
		left: 8px;
		top: 0;
		width: 1px;
		height: 100%;
	}
	.vertical .wall {
		padding: 8px 0;
		width: 100%;
		height: 0;
		cursor: ns-resize;
	}
	.vertical .wall::after {
		top: 8px;
		left: 0;
		width: 100%;
		height: 1px;
	}
</style>
