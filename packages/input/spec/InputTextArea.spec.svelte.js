import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { userEvent } from '@testing-library/user-event'
import { flushSync, tick } from 'svelte'

import InputTextArea from '../src/InputTextArea.svelte'

describe('InputTextArea', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const props = $state({ value: '' })
		const { container } = render(InputTextArea, { props })

		const element = container.querySelector('textarea')
		expect(element.value).toBe('')

		props.value = 'hello'
		flushSync()
		expect(element.value).toBe('hello')
	})

	it('should render as disabled', () => {
		const props = $state({
			value: null,
			disabled: true
		})

		const { container } = render(InputTextArea, { props })
		const element = container.querySelector('textarea')
		expect(element.disabled).toBe(true)

		props.disabled = false
		flushSync()
		expect(element.disabled).toBe(false)
	})

	it('should render as required', () => {
		const props = $state({
			value: null,
			required: true
		})
		const { container } = render(InputTextArea, { props })
		const element = container.querySelector('textarea')
		expect(element.required).toBe(true)

		props.required = false
		flushSync()
		expect(element.required).toBe(false)
	})

	it('should handle input events', async () => {
		const props = $state({ value: '' })
		const { container } = render(InputTextArea, { props })

		const element = container.querySelector('textarea')
		await userEvent.type(element, 'hello')
		await tick()

		expect(props.value).toBe('hello')
	})
})
