import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import ChatMessage from '../src/components/ChatMessage.svelte'
import ChatMessageBodyTest from './ChatMessageBodyTest.svelte'

describe('ChatMessage', () => {
	it('renders role + default markdown body', () => {
		const { container } = render(ChatMessage, {
			message: { id: '1', role: 'assistant', text: 'Hello **world**' }
		})
		const el = container.querySelector('[data-chat-message]')
		expect(el?.getAttribute('data-role')).toBe('assistant')
		expect(container.querySelector('[data-chat-body] strong')?.textContent).toBe('world')
	})
	it('reflects streaming status with a caret', () => {
		const { container } = render(ChatMessage, {
			message: { id: '1', role: 'assistant', text: 'x', status: 'streaming' }
		})
		expect(container.querySelector('[data-chat-message]')?.getAttribute('data-status')).toBe(
			'streaming'
		)
		expect(container.querySelector('[data-chat-caret]')).toBeTruthy()
	})
	it('renders a timestamp when present', () => {
		const { container } = render(ChatMessage, {
			message: { id: '1', role: 'user', text: 'hi', timestamp: '2026-01-01T12:00:00Z' }
		})
		expect(container.querySelector('time[data-chat-time]')).toBeTruthy()
	})
	it('uses the body snippet override instead of the default markdown', () => {
		const { container } = render(ChatMessageBodyTest, {
			message: { id: '1', role: 'assistant', text: 'raw' }
		})
		expect(container.querySelector('[data-custom-body]')?.textContent).toContain('custom: raw')
	})
})
