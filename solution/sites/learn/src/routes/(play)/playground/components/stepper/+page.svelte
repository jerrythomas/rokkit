<script>
	// @ts-nocheck
	import { Stepper } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let props = $state({
		linear: false,
		orientation: 'horizontal'
	})

	const schema = {
		type: 'object',
		properties: {
			linear: { type: 'boolean' },
			orientation: { type: 'string', enum: ['horizontal', 'vertical'] }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/linear', label: 'Linear' },
			{ scope: '#/orientation', label: 'Orientation' }
		]
	}

	let steps = $state([
		{ label: 'Account', completed: true },
		{ label: 'Profile', completed: true },
		{ label: 'Preferences', stages: 3 },
		{ label: 'Review' }
	])

	let current = $state(2)
	let currentStage = $state(0)

	function handleClick(step, stage) {
		current = step
		currentStage = stage ?? 0
	}

	function advance() {
		const step = steps[current]
		if (step.stages && step.stages > 1 && currentStage < step.stages - 1) {
			currentStage++
		} else {
			steps[current] = { ...steps[current], completed: true }
			if (current < steps.length - 1) {
				current++
				currentStage = 0
			}
		}
	}

	function reset() {
		steps = steps.map((s) => ({ ...s, completed: false }))
		current = 0
		currentStage = 0
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex w-full flex-col items-center gap-6 p-6">
			<Stepper
				{steps}
				bind:current
				bind:currentStage
				linear={props.linear}
				orientation={props.orientation}
				onclick={handleClick}
			/>

			<div class="text-surface-z7 text-sm">
				Step {current + 1} of {steps.length}
				{#if steps[current]?.stages && steps[current].stages > 1}
					&middot; Stage {currentStage + 1} of {steps[current].stages}
				{/if}
			</div>

			<div class="flex gap-2">
				<button class="button is-primary" onclick={advance}>
					Next
				</button>
				<button class="button" onclick={reset}>
					Reset
				</button>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
	{/snippet}
</PlaySection>
