<script>
	import Splitter from './Splitter.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {boolean} [vertical]
	 * @property {number} [min]
	 * @property {number} [max]
	 * @property {number} [pos]
	 * @property {import('svelte').Snippet} [a]
	 * @property {import('svelte').Snippet} [b]
	 */

	/** @type {Props} */
	let { vertical = false, min = 30, max = 70, pos = $bindable(30), a, b } = $props()

	let sizes = $derived([pos, 100 - pos])

	let direction = $derived({ direction: vertical ? 'flex-col' : 'flex-row' })
	let sizeA = $derived({
		width: vertical ? 100 : sizes[0],
		height: vertical ? sizes[0] : 100
	})
	let sizeB = $derived({
		width: vertical ? 100 : sizes[1],
		height: vertical ? sizes[1] : 100
	})

	function onSplitterChange(e) {
		pos = e.detail.pos - e.detail.offset
	}
</script>

<div class="relative flex h-full w-full" style:--direction={direction}>
	<section style:--sizeA={sizeA} class="flex flex-shrink flex-grow select-none">
		{@render a?.()}
	</section>
	<section style:--sizeB={sizeB} class="flex flex-shrink flex-grow select-none">
		{@render b?.()}
	</section>
	<Splitter {vertical} {min} {max} {pos} on:change={onSplitterChange} />
</div>

<style>
	div {
		flex-direction: var(--direction);
	}
	section {
		width: calc(var(--width) * 1%);
		height: calc(var(--height) * 1%);
	}
</style>
