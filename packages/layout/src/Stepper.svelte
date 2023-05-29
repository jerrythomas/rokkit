<script>
	// import { format } from 'd3-format'
	import { createEventDispatcher } from 'svelte'

	import Stage from './Stage.svelte'
	import Steps from './ProgressDots.svelte'

	const dispatch = createEventDispatcher()

	export let data
	// export let currentStep
	export let currentStage

	// $: data = data.map((d) => ({
	// 	completed: d.steps?.value == d.steps?.count,
	// 	...d
	// }))
	function handleClick(d) {
		dispatch('click', { ...d, data: data[d.stage] })
	}
</script>

<div
	class="stepper w-full flex flex-col items-center gap-3 border rounded p-8 shadow"
	style:--count={data.length}
>
	<row>
		{#each data as { text, completed, active, steps }, stage}
			<div class="flex flex-col items-center justify-center first:col-start-2">
				<Stage
					{text}
					{completed}
					{active}
					on:click={() => handleClick({ stage })}
				/>
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
					class="col-span-3 w-full flex justify-center font-medium leading-loose text-center text-skin-800"
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
		@apply w-full grid;
		grid-template-columns: repeat(var(--count), 2fr 6fr 2fr);
	}
	.pending {
		@apply text-skin-500 font-light;
	}
</style>
