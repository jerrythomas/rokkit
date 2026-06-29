import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import ChatShell from '../src/components/ChatShell.svelte'

const msgs = [{ id: '1', role: 'assistant', text: 'hi' }]

describe('ChatShell', () => {
	it('renders timeline + composer; no history rail without conversations', () => {
		const { container } = render(ChatShell, { messages: msgs })
		expect(container.querySelector('[data-chat-timeline]')).toBeTruthy()
		expect(container.querySelector('[data-chat-composer]')).toBeTruthy()
		expect(container.querySelector('[data-chat-history]')).toBeFalsy()
		expect(container.querySelector('[data-chat-shell]')?.hasAttribute('data-has-history')).toBe(false)
	})
	it('renders the history rail when conversations are provided', () => {
		const { container } = render(ChatShell, { messages: msgs, conversations: [{ id: 'a', title: 'A' }] })
		expect(container.querySelector('[data-chat-history]')).toBeTruthy()
		expect(container.querySelector('[data-chat-shell]')?.hasAttribute('data-has-history')).toBe(true)
	})
	it('forwards composer submit', async () => {
		const onsubmit = vi.fn()
		const { container } = render(ChatShell, { messages: msgs, value: 'hey', onsubmit })
		await fireEvent.keyDown(container.querySelector('[data-chat-input]')!, { key: 'Enter' })
		expect(onsubmit).toHaveBeenCalledWith('hey')
	})
})
