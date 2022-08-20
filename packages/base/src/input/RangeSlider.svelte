<script>
	import RangeTick from './RangeTick.svelte'
	import Thumb from './Thumb.svelte'

	import { scaleLinear } from 'd3-scale'

	export let min = 0
	export let max = 100
	export let value = [min, min]
	export let single = false
	export let step = 0
	export let ticks

	let limits = [0, 0]
	let lower = 0
	let upper = 0
	let scale
	let width

	function updateScale(width) {
		if (width) {
			limits = [0, width]
			scale = scaleLinear().domain(limits).range([min, max])
			lower = scale.invert(value[0])
			upper = scale.invert(value[1])
		}
	}
	function handleClick(index) {
		// which thumb is nearer? update the value
	}

	$: tickItems = Array.from(
		{ length: ticks + 1 },
		(_, i) => ((max - min) * i) / ticks
	)

	$: steps =
		step > 0
			? Array.from({ length: 1 + (max - min) / step }, (_, i) =>
					Math.min(min + i * step, max)
			  )
			: []
	$: updateScale(width)
</script>

{#if !Array.isArray(value)}
	<error>Expected value to be an array</error>
{:else}
	<range-input class="relative h-10 grid grid-rows-2">
		<range-track class="relative overflow-visible grid">
			<span class="col-start-2 relative" bind:clientWidth={width}>
				<edge class="absolute" />
				<edge class="absolute" />
			</span>
			<selected
				class="absolute col-start-2"
				style:left="{lower}px"
				style:width="{upper - lower}px"
			/>
			{#if !single}
				<Thumb
					bind:cx={lower}
					bind:value={value[0]}
					{steps}
					{scale}
					min={limits[0]}
					max={upper}
				/>
			{/if}
			<Thumb
				bind:cx={upper}
				bind:value={value[1]}
				{steps}
				{scale}
				min={lower}
				max={limits[1]}
			/>
		</range-track>
		{#if ticks}
			<ticks style:--count={ticks}>
				{#each tickItems as tick, i}
					<RangeTick label={tick} on:click={() => handleClick(i)} />
					<!-- {#if i < tickItems.length}
						&nbsp;
					{/if} -->
				{/each}
			</ticks>
		{/if}
	</range-input>
{/if}

<style>
	range-track {
		grid-template-columns: 1rem auto 1rem;
	}
	ticks {
		display: grid;
		grid-gap: calc((100% - 2rem * (var(--count) + 1)) / var(--count));
		grid-template-columns: repeat(var(--count), 2rem) 2rem;
	}
</style>
