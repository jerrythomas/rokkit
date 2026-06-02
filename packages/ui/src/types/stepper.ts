/**
 * Stepper Component Types
 */

import type { Snippet } from 'svelte'

/** Layout orientation for the stepper. */
export type StepperOrientation = 'horizontal' | 'vertical'

/**
 * Definition for a single step in the stepper.
 */
export interface StepperStep {
	/** Step label (shown below the circle). */
	text: string

	/** Short text shown inside the circle. Default: step number. */
	label?: string

	/** Step is finished — shows the check icon. */
	completed?: boolean

	/** Step cannot be navigated to. */
	disabled?: boolean

	/** Number of sub-stages within this step. Default `1`. */
	stages?: number
}

/**
 * Icon overrides for the Stepper component.
 */
export interface StepperIcons {
	/** Icon class for the check / completed state. */
	check?: string
}

/**
 * Props for the Stepper component.
 */
export interface StepperProps {
	/** Array of step definitions. */
	steps?: StepperStep[]

	/** Current step index (bindable). */
	current?: number

	/** Current sub-stage within the step (bindable, 0-based). */
	currentStage?: number

	/**
	 * In linear mode only completed steps + the first incomplete step
	 * are clickable.
	 */
	linear?: boolean

	/** Layout orientation. */
	orientation?: StepperOrientation

	/** Accessible label for the surrounding group. */
	label?: string

	/** Custom icon overrides. */
	icons?: StepperIcons

	/** Called when a step (or sub-stage dot) is clicked. */
	onclick?: (step: number, stage?: number) => void

	/** Content snippet rendered below the stepper. */
	content?: Snippet<[StepperStep, number]>

	/** Additional CSS class. */
	class?: string
}
