<script>
	// import { format } from 'd3-format'
	import { createEventDispatcher } from 'svelte'

	import Stage from './Stage.svelte'
	import Steps from './ProgressDots.svelte'

	const dispatch = createEventDispatcher()

	/**
	 * @typedef {Object} Props
	 * @property {any} data
	 * @property {any} currentStage - export let currentStep
	 */

	/** @type {Props} */
	let { data, currentStage } = $props()

	// $: data = data.map((d) => ({
	// 	completed: d.steps?.value === d.steps?.count,
	// 	...d
	// }))
	function handleClick(d) {
		dispatch('click', { ...d, data: data[d.stage] })
	}
</script>

<div
	class="stepper flex w-full flex-col items-center gap-3 rounded border p-8 shadow"
	style:--count={data.length}
>
	<row>
		{#each data as { text, completed, active, steps }, stage}
			<div class="flex flex-col items-center justify-center first:col-start-2">
				<Stage {text} {completed} {active} on:click={() => handleClick({ stage })} />
			</div>
			{#if steps}
				<div class="col-span-2 flex flex-col items-center justify-center">
					<Steps
						count={steps.count}
						bind:value={steps.value}
						bind:current={steps.current}
						on:click={(e) => handleClick({ ...e.detail, stage })}
					/>
				</div>
			{/if}
		{/each}
	</row>
	<row>
		{#each data as { label }, stage}
			{#if label}
				<p
					class="col-span-3 flex w-full justify-center text-center font-medium leading-loose text-neutral-800"
					class:pending={stage > currentStage}
				>
					{label}
				</p>
			{/if}
		{/each}
	</row>
</div>

<style lang="postcss">
	.stepper row {
		@apply grid w-full;
		grid-template-columns: repeat(var(--count), 2fr 6fr 2fr);
	}
	.pending {
		@apply font-light text-neutral-500;
	}
</style>
