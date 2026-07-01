import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import ChatComposer from '../src/components/ChatComposer.svelte'

const enter = { key: 'Enter' }
const shiftEnter = { key: 'Enter', shiftKey: true }

describe('ChatComposer', () => {
	it('submits on Enter with non-empty value', async () => {
		const onsubmit = vi.fn()
		const { container } = render(ChatComposer, { value: 'hello', onsubmit })
		await fireEvent.keyDown(container.querySelector('[data-chat-input]')!, enter)
		expect(onsubmit).toHaveBeenCalledWith('hello')
	})
	it('does NOT submit on Shift+Enter (newline)', async () => {
		const onsubmit = vi.fn()
		const { container } = render(ChatComposer, { value: 'hello', onsubmit })
		await fireEvent.keyDown(container.querySelector('[data-chat-input]')!, shiftEnter)
		expect(onsubmit).not.toHaveBeenCalled()
	})
	it('does NOT submit when empty / busy / disabled', async () => {
		const onsubmit = vi.fn()
		for (const props of [
			{ value: '   ' },
			{ value: 'x', busy: true },
			{ value: 'x', disabled: true }
		]) {
			const { container } = render(ChatComposer, { ...props, onsubmit })
			await fireEvent.keyDown(container.querySelector('[data-chat-input]')!, enter)
		}
		expect(onsubmit).not.toHaveBeenCalled()
	})
	it('fires onchange on input', async () => {
		const onchange = vi.fn()
		const { container } = render(ChatComposer, { onchange })
		const ta = container.querySelector('[data-chat-input]') as HTMLTextAreaElement
		await fireEvent.input(ta, { target: { value: 'ab' } })
		expect(onchange).toHaveBeenCalledWith('ab')
	})
})
