<script>
	import { createEventDispatcher } from 'svelte'
	import { pannable } from '@rokkit/actions'

	const dispatch = createEventDispatcher()

	/**
	 * @typedef {Object} Props
	 * @property {boolean} [vertical]
	 * @property {any} [limits]
	 * @property {number} [pos]
	 * @property {any} [styles]
	 * @property {import('svelte').Snippet} [a]
	 * @property {import('svelte').Snippet} [b]
	 */

	/** @type {Props} */
	let {
		vertical = false,
		limits = [50, 30],
		pos = $bindable(70),
		styles = ['', ''],
		a,
		b
	} = $props()

	let refs = $state({})

	function clamp(min, max, value) {
		return min > value ? min : max < value ? max : value
	}

	function handlePanMove(event) {
		const { top, bottom, left, right } = refs.wrapper.getBoundingClientRect()
		const extents = horizontal ? [left, right] : [top, bottom]
		let px = clamp(extents[0], extents[1], horizontal ? event.detail.x : event.detail.y)
		pos = clamp(limits[0], 100 - limits[1], (100 * (px - extents[0])) / (extents[1] - extents[0]))
		dispatch('change', { pos })
	}

	let horizontal = $derived(!vertical)
	let side = $derived(horizontal ? 'left' : 'top')
	let dimension = $derived(horizontal ? 'width' : 'height')
	let direction = $derived(vertical ? 'vertical' : 'horizontal')
</script>

<div class="wrapper {direction}" bind:this={refs.wrapper}>
	<div class={styles[0]} style="{dimension}: {pos}%;">
		{@render a?.()}
	</div>
	<div class={styles[1]} style="{dimension}: {100 - pos}%;">
		{@render b?.()}
	</div>
	<span class="wall" use:pannable onpanmove={handlePanMove} style="{side}: calc({pos}% - 8px)"
	></span>
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
