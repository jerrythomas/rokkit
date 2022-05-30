<script>
	import { createEventDispatcher } from 'svelte'

	export let count
	export let progress

	const dispatch = createEventDispatcher()

	$: steps = Array.from({ length: count }, (v, i) => ({
		step: i,
		completed: progress >= (i + 1) / count,
		active:
			progress > 0 &&
			progress < 1 &&
			progress > i / count &&
			progress <= (i + 1) / count
	}))
</script>

<box class="h-16 flex flex-col justify-center items-center col-span-2">
	<span class="flex gap-3 items-center steps" class:empty={count == 0}>
		{#each steps as { step, completed, active }}
			<dot
				class="flex rounded-full w-2 h-2 bg-skin-200 step select-none cursor-pointer"
				class:completed
				class:active
				on:click={dispatch('click', { step: step + 1 })}
			/>
		{/each}
	</span>
</box>

<style lang="postcss">
	.empty {
		@apply w-full border-b border-primary-500;
	}
	.step.completed {
		@apply bg-primary-500 text-white;
	}
	.step.active {
		@apply w-3 h-3 bg-primary-500;
	}
</style>
