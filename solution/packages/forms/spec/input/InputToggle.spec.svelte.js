import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'

import InputToggle from '../../src/input/InputToggle.svelte'

describe('InputToggle', () => {
	beforeEach(() => cleanup())

	it('should render with string options', () => {
		const props = $state({
			value: 'bar',
			options: ['foo', 'bar', 'baz']
		})
		const { container } = render(InputToggle, { props })

		const toggleEl = container.querySelector('[data-toggle]')
		expect(toggleEl).toBeTruthy()

		const buttons = container.querySelectorAll('[data-toggle-option]')
		expect(buttons).toHaveLength(3)
	})

	it('should render selected option', () => {
		const props = $state({
			value: 'bar',
			options: ['foo', 'bar', 'baz']
		})
		const { container } = render(InputToggle, { props })

		const buttons = container.querySelectorAll('[data-toggle-option]')
		expect(buttons[1].hasAttribute('data-selected')).toBe(true)
		expect(buttons[0].hasAttribute('data-selected')).toBe(false)
	})

	it('should render with object options', () => {
		const props = $state({
			value: 'grid',
			options: [
				{ text: 'List', value: 'list' },
				{ text: 'Grid', value: 'grid' },
				{ text: 'Board', value: 'board' }
			]
		})
		const { container } = render(InputToggle, { props })

		const buttons = container.querySelectorAll('[data-toggle-option]')
		expect(buttons).toHaveLength(3)

		// Grid should be selected
		expect(buttons[1].hasAttribute('data-selected')).toBe(true)
	})

	it('should call onchange when option is clicked', async () => {
		const onchange = vi.fn()
		const props = $state({
			value: 'foo',
			options: ['foo', 'bar', 'baz'],
			onchange
		})
		const { container } = render(InputToggle, { props })

		const buttons = container.querySelectorAll('[data-toggle-option]')
		await fireEvent.click(buttons[1])

		expect(onchange).toHaveBeenCalled()
	})

	it('should render as disabled', () => {
		const props = $state({
			value: 'foo',
			options: ['foo', 'bar', 'baz'],
			disabled: true
		})
		const { container } = render(InputToggle, { props })

		const toggleEl = container.querySelector('[data-toggle]')
		expect(toggleEl?.hasAttribute('data-toggle-disabled')).toBe(true)
	})

	it('should toggle disabled state reactively', () => {
		const props = $state({
			value: 'foo',
			options: ['foo', 'bar', 'baz'],
			disabled: true
		})
		const { container } = render(InputToggle, { props })

		const toggleEl = container.querySelector('[data-toggle]')
		expect(toggleEl?.hasAttribute('data-toggle-disabled')).toBe(true)

		props.disabled = false
		flushSync()
		expect(toggleEl?.hasAttribute('data-toggle-disabled')).toBe(false)
	})

	it('should support size prop', () => {
		const props = $state({
			value: 'foo',
			options: ['foo', 'bar'],
			size: 'sm'
		})
		const { container } = render(InputToggle, { props })

		const toggleEl = container.querySelector('[data-toggle]')
		expect(toggleEl?.getAttribute('data-toggle-size')).toBe('sm')
	})

	it('should convert string options to objects for Toggle', () => {
		const props = $state({
			value: 'bar',
			options: ['foo', 'bar', 'baz']
		})
		const { container } = render(InputToggle, { props })

		// Verify labels are rendered from string values
		const labels = container.querySelectorAll('[data-toggle-label]')
		expect(labels).toHaveLength(3)
		expect(labels[0].textContent).toBe('foo')
		expect(labels[1].textContent).toBe('bar')
		expect(labels[2].textContent).toBe('baz')
	})
})
