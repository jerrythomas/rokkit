<script>
	/**
	 * StepIndicator — standalone presentational component showing multi-step form progress.
	 * Place anywhere on the page; wire to FormBuilder.currentStep and FormBuilder.goToStep.
	 */

	let {
		steps = [],
		current = 0,
		onclick = undefined
	} = $props()

	function stepState(index) {
		if (index < current) return 'complete'
		if (index === current) return 'current'
		return 'upcoming'
	}

	function handleClick(index) {
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
