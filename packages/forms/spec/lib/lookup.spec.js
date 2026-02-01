import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createLookup, createLookupManager, clearLookupCache } from '../../src/lib/lookup.svelte.js'
import { flushSync } from 'svelte'

describe('lookup utilities', () => {
	beforeEach(() => {
		clearLookupCache()
		vi.restoreAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('createLookup', () => {
		it('should create a lookup with initial state', () => {
			const lookup = createLookup({
				url: '/api/countries'
			})

			expect(lookup.options).toEqual([])
			expect(lookup.loading).toBe(false)
			expect(lookup.error).toBe(null)
			expect(lookup.dependsOn).toEqual([])
		})

		it('should fetch options from URL', async () => {
			const mockData = [
				{ id: 1, name: 'USA' },
				{ id: 2, name: 'Canada' }
			]

			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockData)
			})

			const lookup = createLookup({
				url: '/api/countries'
			})

			await lookup.fetch()
			flushSync()

			expect(lookup.options).toEqual(mockData)
			expect(lookup.loading).toBe(false)
			expect(lookup.error).toBe(null)
		})

		it('should interpolate URL parameters', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([])
			})

			const lookup = createLookup({
				url: '/api/cities?country={country}',
				dependsOn: ['country']
			})

			await lookup.fetch({ country: 'USA' })

			expect(globalThis.fetch).toHaveBeenCalledWith('/api/cities?country=USA')
		})

		it('should not fetch if dependencies are missing', async () => {
			globalThis.fetch = vi.fn()

			const lookup = createLookup({
				url: '/api/cities?country={country}',
				dependsOn: ['country']
			})

			await lookup.fetch({})

			expect(globalThis.fetch).not.toHaveBeenCalled()
			expect(lookup.options).toEqual([])
		})

		it('should handle fetch errors', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				statusText: 'Internal Server Error'
			})

			const lookup = createLookup({
				url: '/api/countries'
			})

			await lookup.fetch()
			flushSync()

			expect(lookup.options).toEqual([])
			expect(lookup.error).toBe('HTTP 500: Internal Server Error')
		})

		it('should apply transform function', async () => {
			const mockData = {
				data: {
					countries: [
						{ id: 1, name: 'USA' },
						{ id: 2, name: 'Canada' }
					]
				}
			}

			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockData)
			})

			const lookup = createLookup({
				url: '/api/countries',
				transform: (data) => data.data.countries
			})

			await lookup.fetch()
			flushSync()

			expect(lookup.options).toEqual(mockData.data.countries)
		})

		it('should cache results', async () => {
			const mockData = [{ id: 1, name: 'USA' }]

			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockData)
			})

			const lookup = createLookup({
				url: '/api/countries',
				cacheTime: 60000
			})

			await lookup.fetch()
			await lookup.fetch()

			// Should only call fetch once due to caching
			expect(globalThis.fetch).toHaveBeenCalledTimes(1)
		})

		it('should clear cache', async () => {
			const mockData = [{ id: 1, name: 'USA' }]

			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockData)
			})

			const lookup = createLookup({
				url: '/api/countries'
			})

			await lookup.fetch()
			lookup.clearCache()
			await lookup.fetch()

			expect(globalThis.fetch).toHaveBeenCalledTimes(2)
		})

		it('should reset state', async () => {
			const mockData = [{ id: 1, name: 'USA' }]

			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockData)
			})

			const lookup = createLookup({
				url: '/api/countries'
			})

			await lookup.fetch()
			flushSync()
			expect(lookup.options.length).toBe(1)

			lookup.reset()
			flushSync()

			expect(lookup.options).toEqual([])
			expect(lookup.loading).toBe(false)
			expect(lookup.error).toBe(null)
		})
	})

	describe('createLookupManager', () => {
		it('should create manager with multiple lookups', () => {
			const manager = createLookupManager({
				country: { url: '/api/countries' },
				city: { url: '/api/cities?country={country}', dependsOn: ['country'] }
			})

			expect(manager.hasLookup('country')).toBe(true)
			expect(manager.hasLookup('city')).toBe(true)
			expect(manager.hasLookup('unknown')).toBe(false)
		})

		it('should get lookup for field', () => {
			const manager = createLookupManager({
				country: { url: '/api/countries' }
			})

			const lookup = manager.getLookup('country')
			expect(lookup).toBeDefined()
			expect(lookup.options).toEqual([])
		})

		it('should initialize all lookups', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([{ id: 1, name: 'Test' }])
			})

			const manager = createLookupManager({
				country: { url: '/api/countries' }
			})

			await manager.initialize({})
			flushSync()

			const lookup = manager.getLookup('country')
			expect(lookup.options.length).toBe(1)
		})

		it('should handle field change and trigger dependent lookups', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([{ id: 1, name: 'City' }])
			})

			const manager = createLookupManager({
				country: { url: '/api/countries' },
				city: { url: '/api/cities?country={country}', dependsOn: ['country'] }
			})

			await manager.handleFieldChange('country', { country: 'USA' })

			// Should have fetched cities since country changed
			expect(globalThis.fetch).toHaveBeenCalledWith('/api/cities?country=USA')
		})

		it('should clear all caches', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([])
			})

			const manager = createLookupManager({
				country: { url: '/api/countries' },
				city: { url: '/api/cities' }
			})

			await manager.initialize({})
			expect(globalThis.fetch).toHaveBeenCalledTimes(2)

			manager.clearAllCaches()
			await manager.initialize({})
			expect(globalThis.fetch).toHaveBeenCalledTimes(4)
		})
	})
})
