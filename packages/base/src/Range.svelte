<script>
	import Tick from './Tick.svelte'
	import Thumb from './icons/Thumb.svelte'
	import Icon from './Icon.svelte'

	export let count = 5
	export let min = 0
	export let max = 5
	export let tickWidth = 30
	export let value = 0

	const thumbSize = 24
	let width

	$: gapSize = width ? (width - tickWidth * (count + 1)) / count : 0
	$: step = (max - min) / count
	$: ticks = Array.from({ length: count + 1 }, (v, i) => min + i * step)
	$: thumbAt = value * (tickWidth + gapSize) + (tickWidth - thumbSize) / 2
</script>

<div
	class="flex flex-col w-full gap-1 select-none py-1 border"
	bind:clientWidth={width}
	style:--left="{thumbAt}px"
>
	{#if width}
		<track class="h-2 rounded-full bg-primary-500" />
		<div
			class="ticks w-full"
			style:--tick-width="{tickWidth}px"
			style:--count={count + 1}
			style:--gap-size="{gapSize}px"
		>
			{#each ticks as tick, i}
				<Tick
					label={tick}
					width="{tickWidth}px"
					on:click={() => (value = min + i * step)}
				/>
			{/each}
		</div>
		<Icon icon={Thumb} size="{thumbSize}px" class="thumb" />
	{/if}
</div>

<style lang="postcss">
	track {
		grid-column: 2 / calc(var(--count) * 2);
	}
	.ticks {
		display: grid;
		grid-template-columns: repeat(var(--count), var(--tick-width));
		gap: var(--gap-size);
	}
	:global(.thumb) {
		@apply absolute fill-current text-primary-800 top-0 cursor-pointer;
		left: var(--left);
	}
</style>
