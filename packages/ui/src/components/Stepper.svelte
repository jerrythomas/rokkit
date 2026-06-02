<script lang="ts">
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'
	import { messages } from '@rokkit/states'
	import type { StepperIcons, StepperProps } from '../types/stepper.js'

	const defaultIcons: StepperIcons = {
		check: DEFAULT_STATE_ICONS.action.check
	}

	let {
		steps = [],
		current = $bindable(0),
		currentStage = $bindable(0),
		linear = false,
		orientation = 'horizontal',
		label = messages.stepper.label,
		icons: userIcons,
		onclick,
		content,
		class: className = ''
	}: StepperProps = $props()

	const icons = $derived<StepperIcons>({ ...defaultIcons, ...userIcons })

	/**
	 * Whether a step can be clicked
	 */
	function isClickable(index: number): boolean {
		const step = steps[index]
		if (step.disabled) return false
		if (!linear) return true
		// Linear mode: allow completed steps and the first incomplete step
		if (step.completed) return true
		// First incomplete step = first step where index >= first non-completed
		const firstIncomplete = steps.findIndex((s) => !s.completed)
		return index === firstIncomplete
	}

	/**
	 * Whether the connector line before step N should look "completed"
	 */
	function isConnectorCompleted(index: number): boolean {
		return index > 0 && Boolean(steps[index - 1]?.completed)
	}

	/**
	 * Handle step circle click
	 */
	function handleStepClick(index: number) {
		if (!isClickable(index)) return
		current = index
		currentStage = 0
		onclick?.(index)
	}

	/**
	 * Handle sub-stage dot click
	 */
	function handleDotClick(stepIndex: number, stageIndex: number) {
		if (!isClickable(stepIndex)) return
		current = stepIndex
		currentStage = stageIndex
		onclick?.(stepIndex, stageIndex)
	}
</script>

<div
	data-stepper
	data-orientation={orientation}
	class={className || undefined}
	role="group"
	aria-label={label}
>
	{#each steps as step, index (index)}
		<!-- Connector line before step (except first) -->
		{#if index > 0}
			<div
				data-stepper-connector
				data-completed={isConnectorCompleted(index) || undefined}
				aria-hidden="true"
			></div>
		{/if}

		<!-- Step -->
		<div
			data-stepper-step
			data-completed={step.completed || undefined}
			data-active={index === current || undefined}
			data-disabled={step.disabled || undefined}
		>
			<button
				type="button"
				data-stepper-circle
				disabled={!isClickable(index)}
				aria-label="{step.text}{step.completed ? ' (completed)' : ''}"
				aria-current={index === current ? 'step' : undefined}
				onclick={() => handleStepClick(index)}
			>
				{#if step.completed}
					<span data-stepper-check-icon class={icons.check} aria-hidden="true"></span>
				{:else}
					{step.label ?? index + 1}
				{/if}
			</button>

			<span data-stepper-label>{step.text}</span>

			<!-- Sub-stage dots -->
			{#if step.stages && step.stages > 1}
				<div data-stepper-dots aria-label="Sub-stages for {step.text}">
					{#each Array(step.stages) as _, stageIndex (stageIndex)}
						<button
							type="button"
							data-stepper-dot
							data-active={(index === current && stageIndex === currentStage) || undefined}
							data-completed={step.completed ||
								(index === current && stageIndex < currentStage) ||
								undefined}
							disabled={!isClickable(index)}
							aria-label="Stage {stageIndex + 1}"
							onclick={() => handleDotClick(index, stageIndex)}
						></button>
					{/each}
				</div>
			{/if}
		</div>
	{/each}

	<!-- Content area -->
	{#if content && steps[current]}
		<div data-stepper-content>
			{@render content(steps[current], current)}
		</div>
	{/if}
</div>
