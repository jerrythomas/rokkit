import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import ButtonGroup from '../src/components/ButtonGroup.svelte'
import ButtonGroupTest from './ButtonGroupTest.svelte'

describe('ButtonGroup', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a button group container', () => {
		const { container } = render(ButtonGroupTest)
		expect(container.querySelector('[data-button-group]')).toBeTruthy()
	})

	it('has role="group"', () => {
		const { container } = render(ButtonGroupTest)
		const el = container.querySelector('[data-button-group]')
		expect(el?.getAttribute('role')).toBe('group')
	})

	// ─── Size ───────────────────────────────────────────────────────

	it('defaults to size "md"', () => {
		const { container } = render(ButtonGroupTest)
		const el = container.querySelector('[data-button-group]')
		expect(el?.getAttribute('data-size')).toBe('md')
	})

	it('applies size="sm"', () => {
		const { container } = render(ButtonGroupTest, { props: { size: 'sm' } })
		const el = container.querySelector('[data-button-group]')
		expect(el?.getAttribute('data-size')).toBe('sm')
	})

	it('applies size="lg"', () => {
		const { container } = render(ButtonGroupTest, { props: { size: 'lg' } })
		const el = container.querySelector('[data-button-group]')
		expect(el?.getAttribute('data-size')).toBe('lg')
	})

	// ─── Custom class ────────────────────────────────────────────────

	it('applies custom CSS class', () => {
		const { container } = render(ButtonGroupTest, { props: { class: 'my-group' } })
		const el = container.querySelector('[data-button-group]')
		expect(el?.classList.contains('my-group')).toBe(true)
	})

	it('does not add class attribute when className is empty', () => {
		const { container } = render(ButtonGroupTest)
		const el = container.querySelector('[data-button-group]')
		// class attribute should be null/absent when no custom class
		expect(el?.getAttribute('class')).toBeNull()
	})

	// ─── Children ────────────────────────────────────────────────────

	it('renders slotted children', () => {
		const { container } = render(ButtonGroupTest)
		const children = container.querySelectorAll('[data-test-btn]')
		expect(children.length).toBe(2)
	})
})
