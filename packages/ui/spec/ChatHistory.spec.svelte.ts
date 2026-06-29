import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import ChatHistory from '../src/components/ChatHistory.svelte'

const convos = [
	{ id: 'a', title: 'First chat' },
	{ id: 'b', title: 'Second chat', timestamp: '2026-01-01T12:00:00Z' }
]

describe('ChatHistory', () => {
	it('renders conversations and marks the active one', () => {
		const { container } = render(ChatHistory, { conversations: convos, activeId: 'b' })
		const rows = container.querySelectorAll('[data-chat-history-row]')
		expect(rows.length).toBe(2)
		expect(container.querySelector('[data-chat-history-row][data-active]')).toBeTruthy()
	})
	it('fires onselect with the conversation id', async () => {
		const onselect = vi.fn()
		const { container } = render(ChatHistory, { conversations: convos, onselect })
		await fireEvent.click(container.querySelectorAll('[data-chat-history-item]')[0])
		expect(onselect).toHaveBeenCalledWith('a')
	})
	it('fires onnew / ondelete when those handlers are provided', async () => {
		const onnew = vi.fn(); const ondelete = vi.fn()
		const { container } = render(ChatHistory, { conversations: convos, onnew, ondelete })
		await fireEvent.click(container.querySelector('[data-chat-history-new]')!)
		await fireEvent.click(container.querySelectorAll('[data-chat-history-delete]')[0])
		expect(onnew).toHaveBeenCalled()
		expect(ondelete).toHaveBeenCalledWith('a')
	})
	it('renders no rows for an empty conversation list', () => {
		const { container } = render(ChatHistory, { conversations: [] })
		expect(container.querySelectorAll('[data-chat-history-row]').length).toBe(0)
		expect(container.querySelector('[data-chat-history]')).toBeTruthy()
	})
})
