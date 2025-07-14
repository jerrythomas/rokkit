import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSections, getSlug } from './stories.js'

describe('stories.js', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('getSlug', () => {
		it('should return the slug from a file path', () => {
			const file = './welcome/introduction/meta.json'
			const slug = getSlug(file)
			expect(slug).toBe('/welcome/introduction')
		})
	})

	describe('getSections', () => {
		it('should combine metadata from categories and components', () => {
			const result = getSections([])
			expect(result).toEqual([])
		})
		it('should group by categories', () => {
			const metadata = [
				,
				{
					content: { title: 'Elements', category: 'elements', order: 2 },
					file: './elements/meta.json'
				},
				{
					content: { title: 'List', order: 2 },

					group: 'elements',
					file: './elements/list/meta.json'
				},
				{
					content: { title: 'Components', category: 'elements', order: 1 },
					group: 'elements',
					file: './elements/components/meta.json'
				},
				{
					content: { title: 'Welcome', category: 'welcome', order: 1 },
					file: './welcome/meta.json'
				},
				{
					content: { title: 'Getting Started', category: 'welcome', order: 2 },
					file: './welcome/get/meta.json'
				},
				{
					content: { title: 'Introduction', category: 'welcome', order: 1 },
					file: './welcome/introduction/meta.json'
				}
			]
			const result = getSections(metadata)
			expect(result).toEqual([
				{
					title: 'Welcome',
					category: 'welcome',
					order: 1,
					depth: 1,
					slug: '/welcome',
					children: [
						{
							title: 'Introduction',
							category: 'welcome',
							order: 1,
							depth: 2,
							slug: '/welcome/introduction'
						},
						{
							title: 'Getting Started',
							category: 'welcome',
							depth: 2,
							slug: '/welcome/get',
							order: 2
						}
					]
				},
				{
					title: 'Elements',
					category: 'elements',
					order: 2,
					depth: 1,
					slug: '/elements',
					children: [
						{
							title: 'Components',
							order: 1,
							depth: 2,
							category: 'elements',
							slug: '/elements/components'
						},
						{
							title: 'List',
							order: 2,
							depth: 2,
							category: 'elements',
							slug: '/elements/list'
						}
					]
				}
			])
		})
	})
})
