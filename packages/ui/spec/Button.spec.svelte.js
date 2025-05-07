/* eslint-disable no-console */
import { describe, it, expect, beforeEach, beforeAll, vi, afterAll } from 'vitest'
import { render, cleanup } from '@testing-library/svelte'
import { mockFormRequestSubmit } from '@rokkit/helpers/mocks'
import Button from '../src/Button.svelte'
import ButtonWithSnippet from './mocks/ButtonWithSnippet.svelte'
import ButtonInForm from './mocks/ButtonInForm.svelte'
import { flushSync } from 'svelte'

describe('Button', () => {
	const variants = ['primary', 'secondary', 'tertiary']

	beforeAll(() => {
		console.error = vi.fn()
		mockFormRequestSubmit()
	})
	beforeEach(() => {
		cleanup()
	})
	afterAll(() => {
		// Restore original or delete the mock
		vi.restoreAllMocks()
	})
	it('should render with label', () => {
		const props = $state({ label: 'Click me' })
		const { container, getByRole } = render(Button, { props })
		const button = getByRole('button')

		expect(container).toMatchSnapshot()
		expect(button.textContent.trim()).toBe('Click me')

		props.label = 'New label'
		props.description = 'This is a description'
		flushSync()
		expect(container).toMatchSnapshot()
		expect(button.textContent.trim()).toBe('New label')
	})

	it('should render with icons', () => {
		const props = $state({ label: 'Click me' })
		const { container } = render(Button, { props })

		expect(container).toMatchSnapshot()

		props.leftIcon = 'home'
		flushSync()
		expect(container).toMatchSnapshot()

		props.rightIcon = 'chevron-right'
		flushSync()
		expect(container).toMatchSnapshot()

		props.leftIcon = null
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render with a disabled state', () => {
		const { getByRole } = render(Button, { disabled: true })
		const button = getByRole('button')
		expect(button.disabled).toBeTruthy()
	})

	it.each(variants)('should render with variant "%s"', (variant) => {
		const props = $state({ label: 'Click me', variant })
		const { container } = render(Button, { props })
		expect(container).toMatchSnapshot()
	})

	it('should handle click events', () => {
		const props = $state({ label: 'Click me', onclick: vi.fn() })
		const { getByRole } = render(Button, { props })
		const button = getByRole('button')

		button.click()
		expect(props.onclick).toHaveBeenCalled()
	})

	it('should render snippets', () => {
		const { container } = render(ButtonWithSnippet)
		const leftIcon = container.querySelector('#left-icon > button')
		const rightIcon = container.querySelector('#right-icon > button')
		const content = container.querySelector('#content > button')
		expect(leftIcon).toMatchSnapshot()
		expect(rightIcon).toMatchSnapshot()
		expect(content).toMatchSnapshot()
	})

	it('should handle form events', () => {
		const props = $state({ onsubmit: vi.fn(), onreset: vi.fn() })
		const { container } = render(ButtonInForm, { props })
		const buttons = container.querySelectorAll('button')

		buttons[0].click()
		expect(console.error).toHaveBeenCalledOnce()
		expect(props.onsubmit).toHaveBeenCalled()
		expect(props.onreset).not.toHaveBeenCalled()
		buttons[1].click()

		expect(props.onreset).toHaveBeenCalled()
		expect(props.onsubmit).toHaveBeenCalledOnce()
	})
})
