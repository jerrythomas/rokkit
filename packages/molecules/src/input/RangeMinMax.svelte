<script>
	import { run } from 'svelte/legacy';

	import { Thumb, RangeTick } from '@rokkit/atoms'
	import { generateTicks } from '@rokkit/core'
	import { scaleLinear } from 'd3-scale'

	
	
	
	
	
	
	
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
		class: className = '',
		name = null,
		min = 0,
		max = 100,
		value = $bindable([min, min]),
		single = false,
		step = 1,
		ticks = 10,
		labelSkip = 0
	} = $props();

	let limits = $state([0, 0])
	let lower = $state(min)
	let upper = $state(min)
	let scale = $state()
	let width = $state()

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
	let steps =
		$derived(step > 0
			? Array.from({ length: 1 + (max - min) / step }, (_, i) => Math.min(min + i * step, max))
			: [])
	run(() => {
		updateScale(width, min, max)
	});
</script>

{#if !Array.isArray(value)}
	<error>Expected value to be an array</error>
{:else}
	<input-range class="relative h-10 grid grid-rows-2 {className}">
		<input {name} type="hidden" bind:value />
		<range-track class="relative grid">
			<range-track-bar class="relative col-start-2 box-border" bind:clientWidth={width}></range-track-bar>
			<selected-bar
				class="absolute col-start-2"
				style:left="{lower}px"
				style:width="{upper - lower}px"
			></selected-bar>
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
		grid-template-rows: 7px auto;
	}
</style>
