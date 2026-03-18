import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import Message from '../src/components/Message.svelte'

describe('Message', () => {
	beforeEach(() => cleanup())

	it('should render with default type error', () => {
		const { container } = render(Message)
		const root = container.querySelector('[data-message-root]')
		expect(root).toBeTruthy()
		expect(root!.getAttribute('role')).toBe('alert')
		expect(root!.getAttribute('data-type')).toBe('error')
	})

	it('should render text content', () => {
		const { container } = render(Message, { props: { text: 'Something went wrong' } })
		expect(container.querySelector('[data-message-root]')!.textContent).toContain(
			'Something went wrong'
		)
	})

	it('should set data-type for all variants', () => {
		const types = ['error', 'info', 'success', 'warning']
		for (const type of types) {
			cleanup()
			const { container } = render(Message, { props: { text: type, type } })
			expect(container.querySelector('[data-message-root]')!.getAttribute('data-type')).toBe(type)
		}
	})

	it('should use role=status for info and success', () => {
		const { container: ci } = render(Message, { props: { type: 'info' } })
		expect(ci.querySelector('[data-message-root]')!.getAttribute('role')).toBe('status')
		cleanup()
		const { container: cs } = render(Message, { props: { type: 'success' } })
		expect(cs.querySelector('[data-message-root]')!.getAttribute('role')).toBe('status')
	})

	it('should use role=alert for error and warning', () => {
		const { container: ce } = render(Message, { props: { type: 'error' } })
		expect(ce.querySelector('[data-message-root]')!.getAttribute('role')).toBe('alert')
		cleanup()
		const { container: cw } = render(Message, { props: { type: 'warning' } })
		expect(cw.querySelector('[data-message-root]')!.getAttribute('role')).toBe('alert')
	})

	it('should render dismiss button when dismissible', () => {
		const { container } = render(Message, { props: { dismissible: true } })
		expect(container.querySelector('[data-message-dismiss]')).toBeTruthy()
	})

	it('should not render dismiss button when not dismissible', () => {
		const { container } = render(Message, { props: { dismissible: false } })
		expect(container.querySelector('[data-message-dismiss]')).toBeNull()
	})

	it('should call ondismiss when dismiss button clicked', async () => {
		const ondismiss = vi.fn()
		const { container } = render(Message, { props: { dismissible: true, ondismiss } })
		container.querySelector<HTMLButtonElement>('[data-message-dismiss]')!.click()
		expect(ondismiss).toHaveBeenCalledOnce()
	})

	it('should call ondismiss after timeout', async () => {
		vi.useFakeTimers()
		const ondismiss = vi.fn()
		render(Message, { props: { timeout: 2000, ondismiss } })
		vi.advanceTimersByTime(2000)
		expect(ondismiss).toHaveBeenCalledOnce()
		vi.useRealTimers()
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
