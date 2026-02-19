import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'

import InputSelect from '../../src/input/InputSelect.svelte'

describe('InputSelect', () => {
	beforeEach(() => cleanup())

	it('should render with string options', async () => {
		const onchange = vi.fn()
		const props = $state({
			value: 'foo',
			options: ['foo', 'bar', 'baz'],
			onchange
		})
		const { container } = render(InputSelect, { props })

		// Should render the @rokkit/ui Select component
		const selectEl = container.querySelector('[data-select]')
		expect(selectEl).toBeTruthy()

		const trigger = container.querySelector('[data-select-trigger]')
		expect(trigger).toBeTruthy()

		// Open dropdown and verify options
		await fireEvent.click(trigger)
		const options = container.querySelectorAll('[data-select-option]')
		expect(options).toHaveLength(3)

		// Select second option
		await fireEvent.click(options[1])
		expect(onchange).toHaveBeenCalledWith('bar', expect.anything())
	})

	it('should render with objects', async () => {
		const onchange = vi.fn()
		const props = $state({
			value: { text: 'bar' },
			options: [{ text: 'foo' }, { text: 'bar' }, { text: 'baz' }],
			fields: { text: 'text' },
			onchange
		})
		const { container } = render(InputSelect, { props })

		const selectEl = container.querySelector('[data-select]')
		expect(selectEl).toBeTruthy()

		const trigger = container.querySelector('[data-select-trigger]')
		await fireEvent.click(trigger)
		const options = container.querySelectorAll('[data-select-option]')
		expect(options).toHaveLength(3)
	})

	it('should render with text, value objects', async () => {
		const onchange = vi.fn()
		const props = $state({
			value: 3,
			options: [
				{ value: 1, text: 'foo' },
				{ value: 2, text: 'bar' },
				{ value: 3, text: 'baz' }
			],
			fields: { text: 'text', value: 'value' },
			onchange
		})
		const { container } = render(InputSelect, { props })

		const trigger = container.querySelector('[data-select-trigger]')
		expect(trigger).toBeTruthy()

		// Open dropdown
		await fireEvent.click(trigger)
		const options = container.querySelectorAll('[data-select-option]')
		expect(options).toHaveLength(3)

		// Select second option
		await fireEvent.click(options[1])
		expect(onchange).toHaveBeenCalled()
	})

	it('should render as disabled', () => {
		const props = $state({
			value: null,
			options: ['foo', 'bar', 'baz'],
			disabled: true
		})
		const { container } = render(InputSelect, { props })
		const selectEl = container.querySelector('[data-select]')
		const trigger = container.querySelector('[data-select-trigger]')

		expect(selectEl?.hasAttribute('data-disabled')).toBe(true)
		expect(trigger?.hasAttribute('disabled')).toBe(true)

		props.disabled = false
		flushSync()
		expect(selectEl?.hasAttribute('data-disabled')).toBe(false)
		expect(trigger?.hasAttribute('disabled')).toBe(false)
	})

	it('should render with placeholder', () => {
		const props = $state({
			value: null,
			options: ['foo', 'bar', 'baz'],
			placeholder: 'Pick one'
		})
		const { container } = render(InputSelect, { props })
		const placeholder = container.querySelector('[data-select-placeholder]')
		expect(placeholder?.textContent).toContain('Pick one')
	})
})
