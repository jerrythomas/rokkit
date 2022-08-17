<script>
	import { pannable } from '../actions/pannable'
	import Tick from './RangeTick.svelte'

	export let count = 5
	export let min = 0
	export let max = 5
	export let value = 0

	const tickWidth = 30
	const thumbSize = 18

	let sliding = false
	let width

	function thumbX(value, gapSize) {
		return (
			(value / tickStepSize) * (tickWidth + gapSize) +
			(tickWidth - thumbSize) / 2
		)
	}

	function handlePanMove(event) {
		let res =
			((thumbAt + event.detail.dx - (tickWidth - thumbSize) / 2) /
				(tickWidth + gapSize)) *
			tickStepSize
		if (res >= min && res <= max) {
			value = res
		}
	}
	$: count = count > 1 ? count : 1
	$: gapSize = width ? (width - tickWidth * (count + 1)) / count : 0
	$: tickStepSize = (max - min) / count
	$: ticks = Array.from(
		{ length: count + 1 },
		(v, i) => +min + i * tickStepSize
	)
	$: thumbAt = thumbX(value, gapSize)
</script>

<range-input
	class="flex flex-col w-full select-none cursor-pointer relative"
	bind:clientWidth={width}
	style:padding-top="{6}px"
>
	{#if width}
		<range-track class="min-h-2 mt-1 relative overflow-visible">
			<span class="absolute" style:left="{thumbAt}px" />
		</range-track>
		{#if count > 0}
			<range-ticks
				class="w-full"
				style:--tick-width="{tickWidth}px"
				style:--count={count + 1}
				style:--gap-size="{gapSize}px"
			>
				{#each ticks as tick, i}
					<Tick
						label={tick}
						width="{tickWidth}px"
						on:click={() => (value = +min + i * tickStepSize)}
					/>
				{/each}
			</range-ticks>
		{/if}
		<thumb
			class="absolute cursor-pointer"
			style:width="{thumbSize}px"
			style:height="{thumbSize}px"
			style:left="{thumbAt}px"
			class:sliding
			use:pannable
			on:panmove={handlePanMove}
			on:panstart={() => (sliding = true)}
			on:panend={() => (sliding = false)}
		/>
	{/if}
</range-input>

<style lang="css">
	range-track {
		grid-column: 2 / calc(var(--count) * 2);
	}
	range-ticks {
		display: grid;
		grid-template-columns: repeat(var(--count), var(--tick-width));
		gap: var(--gap-size);
	}
</style>
