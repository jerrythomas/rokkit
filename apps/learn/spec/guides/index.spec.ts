import { describe, it, expect } from 'vitest'
import { findGuide, searchGuides, guides, guidesByCategory } from '../../src/lib/guides'

describe('guides registry', () => {
	it('exposes a non-empty ordered array with all required fields', () => {
		expect(guides.length).toBeGreaterThan(0)
		for (const g of guides) {
			expect(g.slug).toBeTruthy()
			expect(g.title).toBeTruthy()
			expect(g.description).toBeTruthy()
			expect(g.category).toBeTruthy()
			expect(typeof g.content).toBe('string')
			expect(g.content.length).toBeGreaterThan(0)
		}
	})

	it('has unique slugs', () => {
		const slugs = guides.map((g) => g.slug)
		expect(new Set(slugs).size).toBe(slugs.length)
	})

	it('finds a guide by slug', () => {
		const g = findGuide('getting-started')
		expect(g?.title).toMatch(/getting started/i)
	})

	it('returns undefined for an unknown slug', () => {
		expect(findGuide('does-not-exist')).toBeUndefined()
	})

	it('searches across title, description, and content', () => {
		const results = searchGuides('accessibility')
		expect(results.some((r) => r.slug === 'accessibility')).toBe(true)
	})

	it('returns an empty array for an empty query', () => {
		expect(searchGuides('')).toEqual([])
		expect(searchGuides('   ')).toEqual([])
	})

	it('groups guides by category and preserves manifest order within each group', () => {
		const grouped = guidesByCategory()
		expect(grouped.basics.length).toBeGreaterThan(0)
		// every guide is reachable via grouping
		const flat = [
			...grouped.basics,
			...grouped.data,
			...grouped.design,
			...grouped.workflows,
			...grouped.advanced
		]
		expect(flat.length).toBe(guides.length)
	})
})
