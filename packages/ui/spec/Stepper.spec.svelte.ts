import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Stepper from '../src/components/Stepper.svelte'

const basicSteps = [{ text: 'Account' }, { text: 'Profile' }, { text: 'Review' }]

const completedSteps = [
	{ text: 'Account', completed: true },
	{ text: 'Profile', completed: true },
	{ text: 'Review' }
]

describe('Stepper', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a stepper container', () => {
		const { container } = render(Stepper, { steps: basicSteps })
		expect(container.querySelector('[data-stepper]')).toBeTruthy()
	})

	it('has role="group"', () => {
		const { container } = render(Stepper, { steps: basicSteps })
		const el = container.querySelector('[data-stepper]')
		expect(el?.getAttribute('role')).toBe('group')
	})

	it('renders correct number of steps', () => {
		const { container } = render(Stepper, { steps: basicSteps })
		const steps = container.querySelectorAll('[data-stepper-step]')
		expect(steps.length).toBe(3)
	})

	it('renders N-1 connector lines', () => {
		const { container } = render(Stepper, { steps: basicSteps })
		const connectors = container.querySelectorAll('[data-stepper-connector]')
		expect(connectors.length).toBe(2)
	})

	function getCircleText(circles: NodeListOf<Element>, index: number): string {
		return circles[index]?.textContent?.trim() ?? ''
	}

	it('shows step numbers by default', () => {
		const { container } = render(Stepper, { steps: basicSteps })
		const circles = container.querySelectorAll('[data-stepper-circle]')
		expect(getCircleText(circles, 0)).toBe('1')
		expect(getCircleText(circles, 1)).toBe('2')
		expect(getCircleText(circles, 2)).toBe('3')
	})

	it('shows custom label when provided', () => {
		const steps = [
			{ text: 'Step A', label: 'A' },
			{ text: 'Step B', label: 'B' }
		]
		const { container } = render(Stepper, { steps })
		const circles = container.querySelectorAll('[data-stepper-circle]')
		expect(circles[0]?.textContent?.trim()).toBe('A')
		expect(circles[1]?.textContent?.trim()).toBe('B')
	})

	it('renders step labels', () => {
		const { container } = render(Stepper, { steps: basicSteps })
		const labels = container.querySelectorAll('[data-stepper-label]')
		expect(labels.length).toBe(3)
		expect(labels[0]?.textContent).toBe('Account')
		expect(labels[2]?.textContent).toBe('Review')
	})

	// ─── States ─────────────────────────────────────────────────────

	it('marks completed steps', () => {
		const { container } = render(Stepper, { steps: completedSteps })
		const steps = container.querySelectorAll('[data-stepper-step]')
		expect(steps[0]?.hasAttribute('data-completed')).toBe(true)
		expect(steps[1]?.hasAttribute('data-completed')).toBe(true)
		expect(steps[2]?.hasAttribute('data-completed')).toBe(false)
	})

	it('marks active step', () => {
		const { container } = render(Stepper, { steps: basicSteps, current: 1 })
		const steps = container.querySelectorAll('[data-stepper-step]')
		expect(steps[0]?.hasAttribute('data-active')).toBe(false)
		expect(steps[1]?.hasAttribute('data-active')).toBe(true)
		expect(steps[2]?.hasAttribute('data-active')).toBe(false)
	})

	it('shows semantic check icon on completed steps', () => {
		const { container } = render(Stepper, { steps: completedSteps })
		const completedCircles = container.querySelectorAll(
			'[data-stepper-step][data-completed] [data-stepper-circle]'
		)
		completedCircles.forEach((circle) => {
			const icon = circle.querySelector('[data-stepper-check-icon]')
			expect(icon).toBeTruthy()
			expect(icon?.classList.contains('action-check')).toBe(true)
		})
	})

	it('uses custom check icon override', () => {
		const { container } = render(Stepper, {
			steps: completedSteps,
			icons: { check: 'custom-check' }
		})
		const circle = container.querySelector(
			'[data-stepper-step][data-completed] [data-stepper-circle]'
		)
		expect(circle?.querySelector('.custom-check')).toBeTruthy()
	})

	it('marks connector as completed when previous step is completed', () => {
		const { container } = render(Stepper, { steps: completedSteps })
		const connectors = container.querySelectorAll('[data-stepper-connector]')
		// Connector before step 1 → step 0 is completed
		expect(connectors[0]?.hasAttribute('data-completed')).toBe(true)
		// Connector before step 2 → step 1 is completed
		expect(connectors[1]?.hasAttribute('data-completed')).toBe(true)
	})

	it('disables disabled steps', () => {
		const steps = [{ text: 'First' }, { text: 'Disabled', disabled: true }, { text: 'Third' }]
		const { container } = render(Stepper, { steps })
		const circles = container.querySelectorAll('[data-stepper-circle]')
		expect(circles[1]?.hasAttribute('disabled')).toBe(true)
	})

	// ─── Click Navigation ───────────────────────────────────────────

	it('calls onclick when clicking a step', async () => {
		const onclick = vi.fn()
		const { container } = render(Stepper, { steps: basicSteps, onclick })
		const circles = container.querySelectorAll('[data-stepper-circle]')
		await fireEvent.click(circles[1])
		expect(onclick).toHaveBeenCalledWith(1)
	})

	it('does not call onclick for disabled steps', async () => {
		const steps = [{ text: 'First' }, { text: 'Disabled', disabled: true }]
		const onclick = vi.fn()
		const { container } = render(Stepper, { steps, onclick })
		const circles = container.querySelectorAll('[data-stepper-circle]')
		await fireEvent.click(circles[1])
		expect(onclick).not.toHaveBeenCalled()
	})

	// ─── Linear Mode ────────────────────────────────────────────────

	it('linear mode disables steps beyond first incomplete', () => {
		const steps = [{ text: 'Done', completed: true }, { text: 'Current' }, { text: 'Future' }]
		const { container } = render(Stepper, { steps, linear: true })
		const circles = container.querySelectorAll('[data-stepper-circle]')
		// Step 0 (completed) → clickable
		expect(circles[0]?.hasAttribute('disabled')).toBe(false)
		// Step 1 (first incomplete) → clickable
		expect(circles[1]?.hasAttribute('disabled')).toBe(false)
		// Step 2 (future) → disabled
		expect(circles[2]?.hasAttribute('disabled')).toBe(true)
	})

	it('linear mode allows clicking completed steps', async () => {
		const onclick = vi.fn()
		const { container } = render(Stepper, { steps: completedSteps, linear: true, onclick })
		const circles = container.querySelectorAll('[data-stepper-circle]')
		await fireEvent.click(circles[0])
		expect(onclick).toHaveBeenCalledWith(0)
	})

	it('linear mode does not fire onclick on future steps', async () => {
		const steps = [{ text: 'Done', completed: true }, { text: 'Current' }, { text: 'Future' }]
		const onclick = vi.fn()
		const { container } = render(Stepper, { steps, linear: true, onclick })
		const circles = container.querySelectorAll('[data-stepper-circle]')
		await fireEvent.click(circles[2])
		expect(onclick).not.toHaveBeenCalled()
	})

	// ─── Sub-Stages (Dots) ──────────────────────────────────────────

	it('renders dots when step has stages > 1', () => {
		const steps = [{ text: 'Step 1', stages: 3 }, { text: 'Step 2' }]
		const { container } = render(Stepper, { steps })
		const dots = container.querySelectorAll('[data-stepper-dot]')
		expect(dots.length).toBe(3)
	})

	it('does not render dots when stages is 1 or absent', () => {
		const steps = [{ text: 'Step 1', stages: 1 }, { text: 'Step 2' }]
		const { container } = render(Stepper, { steps })
		expect(container.querySelectorAll('[data-stepper-dot]').length).toBe(0)
	})

	it('marks active dot', () => {
		const steps = [{ text: 'Step 1', stages: 3 }]
		const { container } = render(Stepper, { steps, current: 0, currentStage: 1 })
		const dots = container.querySelectorAll('[data-stepper-dot]')
		expect(dots[0]?.hasAttribute('data-active')).toBe(false)
		expect(dots[1]?.hasAttribute('data-active')).toBe(true)
		expect(dots[2]?.hasAttribute('data-active')).toBe(false)
	})

	it('marks completed dots', () => {
		const steps = [{ text: 'Step 1', stages: 3 }]
		const { container } = render(Stepper, { steps, current: 0, currentStage: 2 })
		const dots = container.querySelectorAll('[data-stepper-dot]')
		// Dots before currentStage are completed
		expect(dots[0]?.hasAttribute('data-completed')).toBe(true)
		expect(dots[1]?.hasAttribute('data-completed')).toBe(true)
		expect(dots[2]?.hasAttribute('data-active')).toBe(true)
	})

	it('calls onclick with step and stage when clicking a dot', async () => {
		const steps = [{ text: 'Step 1', stages: 3 }]
		const onclick = vi.fn()
		const { container } = render(Stepper, { steps, onclick })
		const dots = container.querySelectorAll('[data-stepper-dot]')
		await fireEvent.click(dots[2])
		expect(onclick).toHaveBeenCalledWith(0, 2)
	})

	// ─── Orientation ────────────────────────────────────────────────

	it('defaults to horizontal orientation', () => {
		const { container } = render(Stepper, { steps: basicSteps })
		const el = container.querySelector('[data-stepper]')
		expect(el?.getAttribute('data-orientation')).toBe('horizontal')
	})

	it('supports vertical orientation', () => {
		const { container } = render(Stepper, { steps: basicSteps, orientation: 'vertical' })
		const el = container.querySelector('[data-stepper]')
		expect(el?.getAttribute('data-orientation')).toBe('vertical')
	})

	// ─── Custom Class ───────────────────────────────────────────────

	it('applies custom class', () => {
		const { container } = render(Stepper, { steps: basicSteps, class: 'my-stepper' })
		const el = container.querySelector('[data-stepper]')
		expect(el?.classList.contains('my-stepper')).toBe(true)
	})

	// ─── ARIA ───────────────────────────────────────────────────────

	it('sets aria-current="step" on active step circle', () => {
		const { container } = render(Stepper, { steps: basicSteps, current: 1 })
		const circles = container.querySelectorAll('[data-stepper-circle]')
		expect(circles[0]?.getAttribute('aria-current')).toBeNull()
		expect(circles[1]?.getAttribute('aria-current')).toBe('step')
		expect(circles[2]?.getAttribute('aria-current')).toBeNull()
	})

	it('sets aria-label on step circles', () => {
		const { container } = render(Stepper, { steps: completedSteps })
		const circles = container.querySelectorAll('[data-stepper-circle]')
		expect(circles[0]?.getAttribute('aria-label')).toBe('Account (completed)')
		expect(circles[2]?.getAttribute('aria-label')).toBe('Review')
	})

	// ─── Empty State ────────────────────────────────────────────────

	it('renders empty stepper with no steps', () => {
		const { container } = render(Stepper, { steps: [] })
		const el = container.querySelector('[data-stepper]')
		expect(el).toBeTruthy()
		expect(container.querySelectorAll('[data-stepper-step]').length).toBe(0)
	})

	// ─── Translatable Labels ────────────────────────────────────────

	it('uses default label from MessagesStore', () => {
		const { container } = render(Stepper, { steps: basicSteps })
		const el = container.querySelector('[data-stepper]')
		expect(el?.getAttribute('aria-label')).toBe('Progress')
	})

	it('allows custom label prop to override default', () => {
		const { container } = render(Stepper, { steps: basicSteps, label: 'Fortschritt' })
		const el = container.querySelector('[data-stepper]')
		expect(el?.getAttribute('aria-label')).toBe('Fortschritt')
	})
})
