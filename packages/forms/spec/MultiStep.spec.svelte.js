import { describe, it, expect, beforeEach } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import { FormBuilder } from '../src/lib/builder.svelte.js'
import StepIndicator from '../src/StepIndicator.svelte'
import FormRenderer from '../src/FormRenderer.svelte'

// ── Shared fixtures ────────────────────────────────────────────────────────

const schema = {
	type: 'object',
	properties: {
		firstName: { type: 'string', required: true },
		lastName: { type: 'string' },
		username: { type: 'string', required: true },
		password: { type: 'string' }
	}
}

const stepLayout = {
	type: 'vertical',
	elements: [
		{
			type: 'step',
			label: 'Personal Info',
			elements: [
				{ scope: '#/firstName', label: 'First Name' },
				{ scope: '#/lastName', label: 'Last Name' }
			]
		},
		{
			type: 'step',
			label: 'Account Setup',
			elements: [
				{ scope: '#/username', label: 'Username' },
				{ scope: '#/password', label: 'Password' }
			]
		}
	]
}

const flatLayout = {
	type: 'vertical',
	elements: [
		{ scope: '#/firstName', label: 'First Name' },
		{ scope: '#/lastName', label: 'Last Name' }
	]
}

// ── FormBuilder multi-step ─────────────────────────────────────────────────

describe('FormBuilder — multi-step', () => {
	let builder

	beforeEach(() => {
		builder = new FormBuilder({}, schema, stepLayout)
	})

	it('isMultiStep is true for step layouts', () => {
		expect(builder.isMultiStep).toBe(true)
	})

	it('isMultiStep is false for flat layouts', () => {
		const flat = new FormBuilder({}, schema, flatLayout)
		expect(flat.isMultiStep).toBe(false)
	})

	it('totalSteps returns count of step elements', () => {
		expect(builder.totalSteps).toBe(2)
	})

	it('currentStep starts at 0', () => {
		expect(builder.currentStep).toBe(0)
	})

	it('canAdvance is true on first step', () => {
		expect(builder.canAdvance).toBe(true)
	})

	it('canAdvance is false on last step', () => {
		flushSync(() => {
			builder.updateField('firstName', 'Alice')
		})
		flushSync(() => { builder.next() })
		expect(builder.canAdvance).toBe(false)
	})

	it('elements returns only current step fields', () => {
		const scopes = builder.elements.map((el) => el.scope)
		expect(scopes).toContain('#/firstName')
		expect(scopes).toContain('#/lastName')
		expect(scopes).not.toContain('#/username')
	})

	it('elements updates when step changes', () => {
		flushSync(() => {
			builder.updateField('firstName', 'Alice')
			builder.next()
		})
		const scopes = builder.elements.map((el) => el.scope)
		expect(scopes).toContain('#/username')
		expect(scopes).not.toContain('#/firstName')
	})

	it('next() advances when current step is valid', () => {
		flushSync(() => {
			builder.updateField('firstName', 'Alice')
		})
		const result = flushSync(() => builder.next())
		expect(result).toBe(true)
		expect(builder.currentStep).toBe(1)
	})

	it('next() blocks when required field is empty', () => {
		const result = flushSync(() => builder.next())
		expect(result).toBe(false)
		expect(builder.currentStep).toBe(0)
	})

	it('next() returns false on the last step', () => {
		flushSync(() => {
			builder.updateField('firstName', 'Alice')
			builder.next()
		})
		flushSync(() => {
			builder.updateField('username', 'alice99')
		})
		const result = flushSync(() => builder.next())
		expect(result).toBe(false)
		expect(builder.currentStep).toBe(1)
	})

	it('prev() moves back', () => {
		flushSync(() => {
			builder.updateField('firstName', 'Alice')
			builder.next()
		})
		flushSync(() => { builder.prev() })
		expect(builder.currentStep).toBe(0)
	})

	it('prev() returns false on first step', () => {
		const result = flushSync(() => builder.prev())
		expect(result).toBe(false)
		expect(builder.currentStep).toBe(0)
	})

	it('goToStep() navigates to a completed step', () => {
		flushSync(() => {
			builder.updateField('firstName', 'Alice')
			builder.next()
		})
		flushSync(() => { builder.goToStep(0) })
		expect(builder.currentStep).toBe(0)
	})

	it('goToStep() throws when jumping forward', () => {
		expect(() => builder.goToStep(1)).toThrow()
	})

	it('validateStep() returns true for a valid step', () => {
		flushSync(() => {
			builder.updateField('firstName', 'Alice')
		})
		expect(builder.validateStep(0)).toBe(true)
	})

	it('validateStep() returns false when required field is empty', () => {
		expect(builder.validateStep(0)).toBe(false)
	})

	it('validate() collects errors across all steps', () => {
		const results = flushSync(() => builder.validate())
		expect(Object.keys(results)).toContain('firstName')
		expect(Object.keys(results)).toContain('username')
	})
})

// ── StepIndicator ──────────────────────────────────────────────────────────

describe('StepIndicator', () => {
	beforeEach(() => cleanup())

	const steps = ['Personal Info', 'Account Setup', 'Review']

	it('renders the correct number of step items', () => {
		const { container } = render(StepIndicator, { props: { steps, current: 0 } })
		const items = container.querySelectorAll('[data-step-item]')
		expect(items).toHaveLength(3)
	})

	it('assigns correct data-step-state', () => {
		const { container } = render(StepIndicator, { props: { steps, current: 1 } })
		const items = container.querySelectorAll('[data-step-item]')
		expect(items[0].dataset.stepState).toBe('complete')
		expect(items[1].dataset.stepState).toBe('current')
		expect(items[2].dataset.stepState).toBe('upcoming')
	})

	it('calls onclick when a complete step is clicked', () => {
		let clicked = null
		const { container } = render(StepIndicator, {
			props: { steps, current: 2, onclick: (i) => (clicked = i) }
		})
		const items = container.querySelectorAll('[data-step-item]')
		fireEvent.click(items[0])
		expect(clicked).toBe(0)
	})

	it('does not call onclick when current step is clicked', () => {
		let clicked = null
		const { container } = render(StepIndicator, {
			props: { steps, current: 1, onclick: (i) => (clicked = i) }
		})
		const items = container.querySelectorAll('[data-step-item]')
		fireEvent.click(items[1])
		expect(clicked).toBeNull()
	})

	it('does not call onclick when upcoming step is clicked', () => {
		let clicked = null
		const { container } = render(StepIndicator, {
			props: { steps, current: 0, onclick: (i) => (clicked = i) }
		})
		const items = container.querySelectorAll('[data-step-item]')
		fireEvent.click(items[2])
		expect(clicked).toBeNull()
	})

	it('renders step numbers and labels', () => {
		const { container } = render(StepIndicator, { props: { steps, current: 0 } })
		expect(container.querySelector('[data-step-number]').textContent).toBe('1')
		expect(container.querySelector('[data-step-label]').textContent).toBe('Personal Info')
	})
})

// ── FormRenderer multi-step integration ───────────────────────────────────

describe('FormRenderer — multi-step', () => {
	beforeEach(() => cleanup())

	it('renders only current step fields', () => {
		const { container } = render(FormRenderer, {
			props: { data: {}, schema, layout: stepLayout, onsubmit: () => {} }
		})
		expect(container.querySelector('[data-scope="#/firstName"]')).toBeTruthy()
		expect(container.querySelector('[data-scope="#/username"]')).toBeNull()
	})

	it('renders Next button on first step', () => {
		const { container } = render(FormRenderer, {
			props: { data: {}, schema, layout: stepLayout, onsubmit: () => {} }
		})
		expect(container.querySelector('[data-form-next]')).toBeTruthy()
		expect(container.querySelector('[data-form-prev]')).toBeNull()
		expect(container.querySelector('[data-form-submit]')).toBeNull()
	})

	it('sets data-form-step attribute on form root', () => {
		const { container } = render(FormRenderer, {
			props: { data: {}, schema, layout: stepLayout, onsubmit: () => {} }
		})
		expect(container.querySelector('[data-form-step="0"]')).toBeTruthy()
	})

	it('wraps step content in data-form-step-content', () => {
		const { container } = render(FormRenderer, {
			props: { data: {}, schema, layout: stepLayout, onsubmit: () => {} }
		})
		expect(container.querySelector('[data-form-step-content]')).toBeTruthy()
	})
})
