<script>
	import Splitter from './Splitter.svelte'

	export let vertical = false
	export let min = 30
	export let max = 70
	export let pos = 30

	$: sizes = [pos, 100 - pos]

	$: direction = { direction: vertical ? 'flex-col' : 'flex-row' }
	$: sizeA = {
		width: vertical ? 100 : sizes[0],
		height: vertical ? sizes[0] : 100
	}
	$: sizeB = {
		width: vertical ? 100 : sizes[1],
		height: vertical ? sizes[1] : 100
	}

	function onSplitterChange(e) {
		pos = e.detail.pos - e.detail.offset
	}
</script>

<div class="relative h-full w-full flex" style:--direction={direction}>
	<section style:--sizeA={sizeA} class="flex flex-shrink flex-grow select-none">
		<slot name="a" />
	</section>
	<section style:--sizeB={sizeB} class="flex flex-shrink flex-grow select-none">
		<slot name="b" />
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
