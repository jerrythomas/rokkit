<script>
	import { format } from 'd3-format'
	import { createEventDispatcher } from 'svelte'
	import Stage from './Stage.svelte'
	import Steps from './Steps.svelte'

	const dispatch = createEventDispatcher()

	export let stages = 4
	export let steps = 4
	export let formatString = ''

	$: formatter = format(formatString)
	$: stages = Array.isArray(stages)
		? stages.map((x, i) => ({ ...x, stage: formatter(i + 1) }))
		: Array.from({ length: stages }, (v, i) => ({
				stage: formatter(i + 1),
				steps
		  }))
</script>

<div
	class="p-8 flex flex-col w-full gap-3 border rounded shadow items-center stepper"
	style:--count={stages.length}
>
	<div>
		{#each stages as { stage, progress }, i}
			<Stage
				number={stage}
				{progress}
				on:click={(e) => dispatch('click', { stage: i + 1, progress })}
			/>
			{#if stage < stages.length}
				<Steps
					count={steps}
					{progress}
					on:click={(e) =>
						dispatch('click', { stage: i + 1, progress, ...e.detail })}
				/>
			{/if}
		{/each}
	</div>
	<div>
		{#each stages as { label, progress }}
			{#if label}
				<p
					class="w-full flex justify-center text-center col-span-3 font-medium text-skin-800 leading-loose"
					class:pending={progress == 0}
				>
					{label}
				</p>
			{/if}
		{/each}
	</div>
</div>

<style lang="postcss">
	.stepper div {
		@apply w-full grid;
		grid-template-columns: repeat(var(--count), 2fr 6fr 2fr);
	}
	.pending {
		@apply text-skin-500 font-light;
	}
</style>
