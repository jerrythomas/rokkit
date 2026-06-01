import { describe, it, expect } from 'vitest'
import { catalog, miniIndex } from '../../src/lib/koan/catalog'

describe('catalog', () => {
	it('has unique demo ids', () => {
		const ids = catalog.map((d) => d.id)
		expect(new Set(ids).size).toBe(ids.length)
	})

	it('builds a minisearch index that finds theme by id', () => {
		const results = miniIndex.search('theme-wizard')
		expect(results[0]?.id).toBe('theme-wizard')
	})

	it('matches keyword synonyms', () => {
		const results = miniIndex.search('notification')
		expect(results.map((r) => r.id)).toContain('toasts')
	})

	it('is fuzzy enough to match typos', () => {
		const results = miniIndex.search('tabz', { fuzzy: 0.2 })
		expect(results.map((r) => r.id)).toContain('tabs')
	})
})
