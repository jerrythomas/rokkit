<script>
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	export let count
	export let value = -1
	export let current = -1

	$: inprogress = current === value + 1 ? current : inprogress
	// $: enabled = count > 0

	function handleClick(e) {
		const step = parseInt(e.target.dataset.step)
		if (e.target.dataset.clickable === 'true') {
			current = step
			dispatch('change', { count, value, current })
		}
	}

	$: steps = Array.from({ length: count }, (_, i) => i)
</script>

<span class="progress flex items-center gap-2" class:empty={count === 0}>
	{#each steps as step, index (index)}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<dot
			class="step flex h-3 w-3 rounded-full border-2 border-neutral-100 bg-neutral-300"
			on:click={handleClick}
			data-step={step}
			data-active={step === current}
			data-completed={step <= value}
			data-clickable={step <= value || step <= inprogress}
			role="option"
			aria-selected={step === current}
			tabindex="0"
		></dot>
	{/each}
</span>

<style lang="postcss">
	.empty {
		@apply border-primary-500 w-full border-b;
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
