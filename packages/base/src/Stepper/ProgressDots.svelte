<script>
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	export let count
	export let value = -1
	export let current = -1

	$: inprogress = current === value + 1 ? current : inprogress
	$: enabled = count > 0 && (value >= 0 || inprogress > 0)

	function handleClick(e) {
		const step = parseInt(e.target.dataset.step)
		if (enabled && (value >= step || inprogress >= step)) {
			current = step
			dispatch('change', { count, value, current })
		}
	}

	$: steps = Array.from({ length: count }, (_, i) => i)
</script>

<span class="flex gap-2 items-center progress" class:empty={count == 0}>
	{#each steps as step}
		<dot
			class="flex rounded-full border-2 border-skin-100 w-3 h-3 bg-skin-300 step"
			on:click={handleClick}
			data-step={step}
			data-active={step == current}
			data-completed={step <= value}
			data-clickable={(step <= value || step <= inprogress) && enabled}
		/>
	{/each}
</span>

<style lang="postcss">
	.empty {
		@apply w-full border-b border-primary-500;
	}
	.step[data-clickable='true'] {
		@apply cursor-pointer;
	}
	.step[data-completed='true'] {
		@apply bg-primary-500;
	}
	.step[data-active='true'] {
		@apply border-primary-400 bg-primary-500;
	}
</style>
