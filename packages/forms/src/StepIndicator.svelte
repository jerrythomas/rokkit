<script lang="ts">
	/**
	 * StepIndicator — standalone presentational component showing multi-step form progress.
	 * Place anywhere on the page; wire to FormBuilder.currentStep and FormBuilder.goToStep.
	 */

	type Props = {
		steps?: string[]
		current?: number
		onclick?: (index: number) => void
	}

	let { steps = [], current = 0, onclick = undefined }: Props = $props()

	function stepState(index: number): 'complete' | 'current' | 'upcoming' {
		if (index < current) return 'complete'
		if (index === current) return 'current'
		return 'upcoming'
	}

	function handleClick(index: number) {
		if (index < current) onclick?.(index)
	}
</script>

<ol data-step-indicator>
	{#each steps as label, index (index)}
		{@const state = stepState(index)}
		<li data-step-item data-step-state={state}>
			{#if state === 'complete'}
				<button
					type="button"
					data-step-number
					onclick={() => handleClick(index)}
					onkeydown={(e) => e.key === 'Enter' && handleClick(index)}
				>{index + 1}</button>
			{:else}
				<span data-step-number>{index + 1}</span>
			{/if}
			<span data-step-label>{label}</span>
		</li>
	{/each}
</ol>
