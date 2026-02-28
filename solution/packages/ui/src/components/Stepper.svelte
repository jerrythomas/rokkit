<script lang="ts">
	import type { Snippet } from 'svelte'

	interface StepperStep {
		/** Step label (shown below circle) */
		text: string
		/** Short text inside circle (default: step number) */
		label?: string
		/** Step is finished (shows checkmark) */
		completed?: boolean
		/** Step cannot be navigated to */
		disabled?: boolean
		/** Number of sub-stages within this step (default: 1) */
		stages?: number
	}

	interface StepperIcons {
		/** Icon class for completed state (default: i-lucide:check) */
		completed?: string
	}

	interface StepperProps {
		/** Array of step definitions */
		steps?: StepperStep[]
		/** Current step index (bindable) */
		current?: number
		/** Current sub-stage within step (bindable, 0-based) */
		currentStage?: number
		/** Only allow clicking completed steps + first incomplete */
		linear?: boolean
		/** Layout orientation */
		orientation?: 'horizontal' | 'vertical'
		/** Custom icons */
		icons?: StepperIcons
		/** Callback when a step or dot is clicked */
		onclick?: (step: number, stage?: number) => void
		/** Content snippet rendered below the stepper */
		content?: Snippet<[StepperStep, number]>
		/** Additional CSS class */
		class?: string
	}

	const defaultIcons: StepperIcons = {
		completed: 'i-lucide:check'
	}

	let {
		steps = [],
		current = $bindable(0),
		currentStage = $bindable(0),
		linear = false,
		orientation = 'horizontal',
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
	aria-label="Progress"
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
					<span class={icons.completed} aria-hidden="true"></span>
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
							data-active={index === current && stageIndex === currentStage || undefined}
							data-completed={step.completed || (index === current && stageIndex < currentStage) || undefined}
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
