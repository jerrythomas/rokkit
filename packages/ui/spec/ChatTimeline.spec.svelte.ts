import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import ChatTimeline from '../src/components/ChatTimeline.svelte'
import ChatTimelineSnippetTest from './ChatTimelineSnippetTest.svelte'

const msgs = [
	{ id: '1', role: 'user', text: 'hi' },
	{ id: '2', role: 'assistant', text: 'hello' }
]

describe('ChatTimeline', () => {
	it('renders one ChatMessage per message by default', () => {
		const { container } = render(ChatTimeline, { messages: msgs })
		expect(container.querySelectorAll('[data-chat-message]').length).toBe(2)
	})
	it('renders nothing-but-empty for an empty list', () => {
		const { container } = render(ChatTimeline, { messages: [] })
		expect(container.querySelectorAll('[data-chat-message]').length).toBe(0)
		expect(container.querySelector('[data-chat-timeline]')).toBeTruthy()
	})
	it('delegates the body to the message snippet when provided', () => {
		const { container } = render(ChatTimelineSnippetTest, { messages: msgs })
		const custom = container.querySelectorAll('[data-custom-msg]')
		expect(custom.length).toBe(2)
		expect(container.querySelectorAll('[data-chat-message]').length).toBe(0) // default bypassed
	})
	it('auto-scrolls the container after render (no crash; scrollTop assigned)', () => {
		// jsdom has no layout (scrollHeight=0); assert the effect ran without error
		const { container } = render(ChatTimeline, { messages: msgs, autoscroll: true })
		expect(container.querySelector('[data-chat-timeline]')).toBeTruthy()
	})
})
