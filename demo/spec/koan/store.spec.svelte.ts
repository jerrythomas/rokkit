import { describe, it, expect, beforeEach } from 'vitest'
import { koan, recordVisit, resetSession } from '../../src/lib/koan/store.svelte'

describe('koan store', () => {
	beforeEach(() => {
		localStorage.clear()
		resetSession()
	})

	it('starts with empty state', () => {
		expect(koan.query).toBe('')
		expect(koan.history).toEqual([])
		expect(koan.activeDemoId).toBeNull()
		expect(koan.visitedThisSession.size).toBe(0)
	})

	it('recordVisit adds entry, marks visited, persists', () => {
		recordVisit('theme-wizard', 'theme')
		expect(koan.history.length).toBe(1)
		expect(koan.history[0].demoId).toBe('theme-wizard')
		expect(koan.history[0].query).toBe('theme')
		expect(koan.visitedThisSession.has('theme-wizard')).toBe(true)
		expect(koan.activeDemoId).toBe('theme-wizard')
		expect(JSON.parse(localStorage.getItem('koan.history')!)).toHaveLength(1)
	})

	it('revisit moves entry to top, no duplicate', () => {
		recordVisit('tabs', 'tabs')
		recordVisit('toasts', 'toast')
		recordVisit('tabs', 'tabs again')
		expect(koan.history.length).toBe(2)
		expect(koan.history[0].demoId).toBe('tabs')
		expect(koan.history[0].query).toBe('tabs again')
	})
})
