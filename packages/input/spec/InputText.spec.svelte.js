import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { userEvent } from '@testing-library/user-event'
import { flushSync, tick } from 'svelte'

import InputText from '../src/InputText.svelte'

describe('InputText', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const props = $state({ value: '' })
		const { container } = render(InputText, { props })

		const element = container.querySelector('input')
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

		const { container } = render(InputText, { props })
		const element = container.querySelector('input')
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
		const { container } = render(InputText, { props })
		expect(container).toMatchSnapshot()
		const element = container.querySelector('input')
		expect(element.required).toBe(true)

		props.required = false
		flushSync()
		expect(element.required).toBe(false)
	})
	it('should render with additional attributes', () => {
		const props = $state({
			value: 'hello',
			id: 'foo',
			name: 'bar'
		})
		const { container } = render(InputText, { props })
		expect(container).toMatchSnapshot()
	})

	it('should handle input events', async () => {
		const props = $state({ value: '' })
		const { container } = render(InputText, { props })

		const element = container.querySelector('input')
		await userEvent.type(element, 'hello')
		await tick()

		expect(props.value).toBe('hello')
	})
})
