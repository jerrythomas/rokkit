import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { flushSync, type Snippet } from 'svelte'
import Message from '../src/components/Message.svelte'

describe('Message', () => {
	beforeEach(() => cleanup())

	it('should render with default type error and no content', () => {
		const { container } = render(Message)
		const root = container.querySelector('[data-message-root]')
		expect(root).toBeTruthy()
		expect(root!.getAttribute('role')).toBe('alert')
		expect(root!.getAttribute('data-type')).toBe('error')
	})

	it('should render text content', () => {
		const { container } = render(Message, { props: { text: 'Something went wrong' } })
		const root = container.querySelector('[data-message-root]')
		expect(root!.textContent).toContain('Something went wrong')
	})

	it('should set data-type for all variants', () => {
		const types = ['error', 'info', 'success', 'warning']
		for (const type of types) {
			cleanup()
			const { container } = render(Message, { props: { text: type, type } })
			expect(container.querySelector('[data-message-root]')!.getAttribute('data-type')).toBe(type)
		}
	})

	it('should update data-type reactively', () => {
		const props = $state({ text: 'Test', type: 'error' as string })
		const { container } = render(Message, { props })
		const root = container.querySelector('[data-message-root]')!
		expect(root.getAttribute('data-type')).toBe('error')
		props.type = 'success'
		flushSync()
		expect(root.getAttribute('data-type')).toBe('success')
	})

	it('should update text reactively', () => {
		const props = $state({ text: 'First', type: 'error' })
		const { container } = render(Message, { props })
		const root = container.querySelector('[data-message-root]')!
		expect(root.textContent).toContain('First')
		props.text = 'Second'
		flushSync()
		expect(root.textContent).toContain('Second')
	})
})
