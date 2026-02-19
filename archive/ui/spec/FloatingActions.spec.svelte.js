import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
import FloatingActions from '../src/FloatingActions.svelte'
import FloatingAction from '../src/FloatingAction.svelte'

describe('FloatingActions.svelte', () => {
	beforeEach(() => cleanup())

	it('should render with default position', () => {
		const { container } = render(FloatingActions)
		const element = container.querySelector('[data-floating-actions]')
		expect(element).toBeTruthy()
		expect(element.dataset.position).toBe('bottom-right')
	})

	it('should render with custom position', () => {
		const { container } = render(FloatingActions, {
			props: { position: 'top-left' }
		})
		const element = container.querySelector('[data-floating-actions]')
		expect(element.dataset.position).toBe('top-left')
	})

	it('should toggle open state on click', async () => {
		const { container } = render(FloatingActions)
		const trigger = container.querySelector('[data-floating-actions-trigger]')

		expect(container.querySelector('[data-floating-actions]').hasAttribute('data-open')).toBe(false)

		await fireEvent.click(trigger)
		await tick()

		expect(container.querySelector('[data-floating-actions]').hasAttribute('data-open')).toBe(true)
	})

	it('should close on Escape key', async () => {
		const props = $state({ open: true })
		const { container } = render(FloatingActions, { props })

		// data-open attribute is present when open
		expect(container.querySelector('[data-floating-actions]').hasAttribute('data-open')).toBe(true)

		await fireEvent.keyDown(window, { key: 'Escape' })
		await tick()

		expect(container.querySelector('[data-floating-actions]').hasAttribute('data-open')).toBe(false)
	})

	it('should apply custom class', () => {
		const { container } = render(FloatingActions, {
			props: { class: 'custom-fab' }
		})
		const element = container.querySelector('[data-floating-actions]')
		expect(element.classList.contains('custom-fab')).toBe(true)
	})

	it('should have accessible trigger button', () => {
		const { container } = render(FloatingActions)
		const trigger = container.querySelector('[data-floating-actions-trigger]')

		expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
		expect(trigger.getAttribute('aria-expanded')).toBe('false')
		expect(trigger.getAttribute('aria-label')).toBe('Open actions menu')
	})
})

describe('FloatingAction.svelte', () => {
	beforeEach(() => cleanup())

	it('should render with icon', () => {
		const { container } = render(FloatingAction, {
			props: { icon: 'plus', label: 'Add item' }
		})
		const element = container.querySelector('[data-floating-action]')
		expect(element).toBeTruthy()
		expect(element.getAttribute('aria-label')).toBe('Add item')
	})

	it('should call onclick handler', async () => {
		const handler = vi.fn()
		const { container } = render(FloatingAction, {
			props: { label: 'Test', onclick: handler }
		})

		await fireEvent.click(container.querySelector('[data-floating-action]'))
		expect(handler).toHaveBeenCalled()
	})

	it('should be disabled when disabled prop is true', () => {
		const { container } = render(FloatingAction, {
			props: { label: 'Test', disabled: true }
		})
		const element = container.querySelector('[data-floating-action]')
		expect(element.disabled).toBe(true)
	})

	it('should have menuitem role', () => {
		const { container } = render(FloatingAction, {
			props: { label: 'Test' }
		})
		const element = container.querySelector('[data-floating-action]')
		expect(element.getAttribute('role')).toBe('menuitem')
	})
})
