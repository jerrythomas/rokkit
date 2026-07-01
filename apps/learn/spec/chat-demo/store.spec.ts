import { describe, it, expect } from 'vitest'
import { setPendingPrompt, takePendingPrompt } from '../../src/lib/chat-demo/store.svelte'

describe('pending prompt one-shot', () => {
	it('returns the set value once, then null', () => {
		setPendingPrompt('Bar chart please')
		expect(takePendingPrompt()).toBe('Bar chart please')
		expect(takePendingPrompt()).toBeNull()
	})
})
