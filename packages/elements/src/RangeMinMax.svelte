<script>
	import { generateTicks } from '@rokkit/core'
	import { scaleLinear } from 'd3-scale'
	import { onMount } from 'svelte'
	import RangeTick from './RangeTick.svelte'
	import RangeSlider from './RangeSlider.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [name]
	 * @property {number} [min]
	 * @property {number} [max]
	 * @property {[number,number]} [value]
	 * @property {boolean} [single]
	 * @property {number} [step]
	 * @property {number} [ticks]
	 * @property {number} [labelSkip]
	 */

	/** @type {Props} */
	let {
		class: classes = '',
		name = null,
		min = 0,
		max = 100,
		value = $bindable([min, min]),
		single = false,
		step = 1,
		ticks = 10,
		labelSkip = 0
	} = $props()

	let limits = $state([0, 0])
	let lower = $state(min)
	let upper = $state(min)
	let scale = $state()
	let width = $state()

	let selectedPos = $derived(`${lower}px`)
	let selectedWidth = $derived(`${upper - lower}px`)

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
		if (index === 0) {
			lower = scale.invert(event.detail)
		} else {
			upper = scale.invert(event.detail)
		}
	}

	let tickStep = $derived(Math.max(1, Math.round((max - min) / ticks)))
	let tickItems = $derived(generateTicks(min, max, tickStep, labelSkip + 1))
	let steps = $derived(
		step > 0
			? Array.from({ length: 1 + (max - min) / step }, (_, i) => Math.min(min + i * step, max))
			: []
	)
	onMount(() => updateScale(width, min, max))
</script>

{#if !Array.isArray(value)}
	<error>Expected value to be an array</error>
{:else}
	<rk-input-range class={classes}>
		<input {name} type="hidden" bind:value />
		<rk-range-track class="relative grid">
			<rk-range-track-bar class="relative col-start-2 box-border" bind:clientWidth={width}>
			</rk-range-track-bar>
			<rk-selected-bar
				class="absolute col-start-2"
				style:left={selectedPos}
				style:width={selectedWidth}
			></rk-selected-bar>
			{#if !single}
				<RangeSlider
					bind:cx={lower}
					bind:value={value[0]}
					{steps}
					{scale}
					min={limits[0]}
					max={upper}
				/>
			{/if}
			<RangeSlider
				bind:cx={upper}
				bind:value={value[1]}
				{steps}
				{scale}
				min={lower}
				max={limits[1]}
			/>
		</rk-range-track>

		<rk-ticks style:--count={tickItems.length - 1}>
			{#each tickItems as { value, label }}
				<RangeTick {label} {value} on:click={handleClick} />
			{/each}
		</rk-ticks>
	</rk-input-range>
{/if}

<style>
	rk-range-track {
		grid-template-columns: 0.5rem auto 0.5rem;
	}
	rk-ticks {
		display: grid;
		grid-gap: calc((100% - 1rem * (var(--count) + 1)) / var(--count));
		grid-template-columns: repeat(var(--count), 1rem) 1rem;
		grid-template-rows: 7px auto;
	}
</style>
