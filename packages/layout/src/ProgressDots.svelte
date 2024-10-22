<script>
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	let { count, value = -1, current = $bindable(-1) } = $props();

	let inprogress = $derived(current === value + 1 ? current : inprogress)
	// $: enabled = count > 0

	function handleClick(e) {
		const step = parseInt(e.target.dataset.step)
		if (e.target.dataset.clickable === 'true') {
			current = step
			dispatch('change', { count, value, current })
		}
	}

	let steps = $derived(Array.from({ length: count }, (_, i) => i))
</script>

<span class="flex items-center gap-2 progress" class:empty={count === 0}>
	{#each steps as step}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<dot
			class="step h-3 w-3 flex border-2 border-neutral-100 rounded-full bg-neutral-300"
			onclick={handleClick}
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
