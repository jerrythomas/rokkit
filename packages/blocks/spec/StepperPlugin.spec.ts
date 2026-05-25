import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import StepperPlugin from '../src/StepperPlugin.svelte'

const validSpec = JSON.stringify({
	steps: [
		{ text: 'Account', completed: true },
		{ text: 'Profile', completed: true },
		{ text: 'Preferences' },
		{ text: 'Review' }
	],
	current: 2
})

describe('StepperPlugin', () => {
	it('renders the rokkit Stepper for a valid spec', () => {
		const { container } = render(StepperPlugin, { props: { code: validSpec } })
		expect(container.querySelector('[data-stepper-plugin]')).toBeTruthy()
	})

	it('renders an error block when steps is missing', () => {
		const { container } = render(StepperPlugin, { props: { code: '{}' } })
		expect(container.querySelector('[data-block-error]')).toBeTruthy()
	})

	it('renders an error block for invalid JSON', () => {
		const { container } = render(StepperPlugin, { props: { code: '{bad' } })
		expect(container.querySelector('[data-block-error]')).toBeTruthy()
	})

	it('toggles to raw spec when the code button is clicked', async () => {
		const { container } = render(StepperPlugin, { props: { code: validSpec } })
		const toggle = container.querySelector('[data-stepper-code-toggle]')!
		await fireEvent.click(toggle)
		expect(container.querySelector('[data-stepper-code]')).toBeTruthy()
	})
})
