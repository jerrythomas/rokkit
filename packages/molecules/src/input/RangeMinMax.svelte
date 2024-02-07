<script>
	import { Thumb, RangeTick } from '@rokkit/atoms'
	import { generateTicks } from '@rokkit/core'
	import { scaleLinear } from 'd3-scale'

	let className = ''
	export { className as class }
	export let name = null
	export let min = 0
	export let max = 100
	export let value = [min, min]
	export let single = false
	export let step = 1
	export let ticks = 10
	export let labelSkip = 0

	let limits = [0, 0]
	let lower = min
	let upper = min
	let scale
	let width

	function updateScale(width, min, max) {
		if (width) {
			limits = [0, width]
			scale = scaleLinear().domain(limits).range([min, max])
			lower = scale.invert(Math.max(value[0], min))
			upper = scale.invert(value[1])
		}
	}
	function handleClick(event) {
		const distance = [Math.abs(event.detail - value[0]), Math.abs(event.detail - value[1])]
		const index = single ? 1 : distance[0] < distance[1] ? 0 : 1

		value[index] = event.detail
		if (index == 0) {
			lower = scale.invert(event.detail)
		} else {
			upper = scale.invert(event.detail)
		}
	}

	$: tickStep = Math.max(1, Math.round((max - min) / ticks))
	$: tickItems = generateTicks(min, max, tickStep, labelSkip + 1)

	$: steps =
		step > 0
			? Array.from({ length: 1 + (max - min) / step }, (_, i) => Math.min(min + i * step, max))
			: []
	$: updateScale(width, min, max)
</script>

{#if !Array.isArray(value)}
	<error>Expected value to be an array</error>
{:else}
	<input-range class="relative h-10 grid grid-rows-2 {className}">
		<input {name} type="hidden" bind:value />
		<range-track class="relative grid">
			<range-track-bar class="relative col-start-2 box-border" bind:clientWidth={width} />
			<selected-bar
				class="absolute col-start-2"
				style:left="{lower}px"
				style:width="{upper - lower}px"
			/>
			{#if !single}
				<Thumb bind:cx={lower} bind:value={value[0]} {steps} {scale} min={limits[0]} max={upper} />
			{/if}
			<Thumb bind:cx={upper} bind:value={value[1]} {steps} {scale} min={lower} max={limits[1]} />
		</range-track>

		<ticks style:--count={tickItems.length - 1}>
			{#each tickItems as { value, label }}
				<RangeTick {label} {value} on:click={handleClick} />
			{/each}
		</ticks>
	</input-range>
{/if}

<style>
	range-track {
		grid-template-columns: 0.5rem auto 0.5rem;
	}
	ticks {
		@apply grid;
		grid-gap: calc((100% - 1rem * (var(--count) + 1)) / var(--count));
		grid-template-columns: repeat(var(--count), 1rem) 1rem;
	}
</style>
