import { describe, it, expect, beforeEach } from 'vitest'
import { koan, submitQuery, selectDemo, resetSession } from '../../src/lib/koan/store.svelte'

describe('koan store', () => {
	beforeEach(() => {
		localStorage.clear()
		resetSession()
	})

	it('starts with empty state', () => {
		expect(koan.query).toBe('')
		expect(koan.messages).toEqual([])
		expect(koan.activeDemoId).toBeNull()
		expect(koan.visitedThisSession.size).toBe(0)
	})

	it('submitQuery adds user + response messages', () => {
		submitQuery('theme')
		expect(koan.messages.length).toBe(2)
		expect(koan.messages[0].kind).toBe('user')
		expect(koan.messages[1].kind).toBe('response')
		const user = koan.messages[0]
		if (user.kind === 'user') {
			expect(user.query).toBe('theme')
		}
	})

	it('submitQuery auto-selects single match', () => {
		submitQuery('theme')
		// theme-wizard is the single match for 'theme'
		expect(koan.activeDemoId).toBe('theme-wizard')
		expect(koan.visitedThisSession.has('theme-wizard')).toBe(true)
	})

	it('submitQuery with no match adds two messages, no auto-select', () => {
		submitQuery('xyzzy')
		expect(koan.messages.length).toBe(2)
		expect(koan.activeDemoId).toBeNull()
		const resp = koan.messages[1]
		if (resp.kind === 'response') {
			expect(resp.matches).toHaveLength(0)
			expect(resp.copy).toContain("don't have anything")
		}
	})

	it('submitQuery clears the query input', () => {
		koan.query = 'theme'
		submitQuery('theme')
		expect(koan.query).toBe('')
	})

	it('messages persist to localStorage', () => {
		submitQuery('theme')
		const stored = JSON.parse(localStorage.getItem('koan.messages')!)
		expect(Array.isArray(stored)).toBe(true)
		expect(stored.length).toBe(2)
	})

	it('selectDemo updates activeDemoId', () => {
		selectDemo('tabs')
		expect(koan.activeDemoId).toBe('tabs')
		expect(koan.visitedThisSession.has('tabs')).toBe(true)
	})

	it('resetSession clears messages and resets state', () => {
		submitQuery('theme')
		resetSession()
		expect(koan.messages).toEqual([])
		expect(koan.activeDemoId).toBeNull()
		expect(koan.visitedThisSession.size).toBe(0)
		expect(localStorage.getItem('koan.messages')).toBe('[]')
	})
})
