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

		describe('fetch hook', () => {
			it('calls async function, sets options, does not use globalThis.fetch', async () => {
				const mockFetchHook = vi.fn().mockResolvedValue([{ id: 1, name: 'Option A' }])
				globalThis.fetch = vi.fn()

				const lookup = createLookup({ fetch: mockFetchHook })
				await lookup.fetch()
				flushSync()

				expect(mockFetchHook).toHaveBeenCalledOnce()
				expect(globalThis.fetch).not.toHaveBeenCalled()
				expect(lookup.options).toEqual([{ id: 1, name: 'Option A' }])
			})

			it('loading transitions: true during fetch, false after', async () => {
				let resolveFn
				const mockFetchHook = vi.fn(
					() =>
						new Promise((resolve) => {
							resolveFn = resolve
						})
				)

				const lookup = createLookup({ fetch: mockFetchHook })
				const fetchPromise = lookup.fetch()

				expect(lookup.loading).toBe(true)

				resolveFn([])
				await fetchPromise
				flushSync()

				expect(lookup.loading).toBe(false)
			})

			it('error from rejected promise sets lookup.error', async () => {
				const mockFetchHook = vi.fn().mockRejectedValue(new Error('Network error'))

				const lookup = createLookup({ fetch: mockFetchHook })
				await lookup.fetch()
				flushSync()

				expect(lookup.error).toBe('Network error')
				expect(lookup.options).toEqual([])
				expect(lookup.loading).toBe(false)
			})

			it('with cacheKey: second call with same key hits cache (fn called once)', async () => {
				const mockFetchHook = vi.fn().mockResolvedValue([{ id: 1 }])
				const cacheKeyFn = vi.fn((params) => `key-${params.type ?? 'all'}`)

				const lookup = createLookup({ fetch: mockFetchHook, cacheKey: cacheKeyFn })

				await lookup.fetch({ type: 'A' })
				await lookup.fetch({ type: 'A' })

				expect(mockFetchHook).toHaveBeenCalledTimes(1)
			})

			it('without cacheKey: no caching, function called on each fetch', async () => {
				const mockFetchHook = vi.fn().mockResolvedValue([{ id: 1 }])

				const lookup = createLookup({ fetch: mockFetchHook })

				await lookup.fetch()
				await lookup.fetch()

				expect(mockFetchHook).toHaveBeenCalledTimes(2)
			})
		})

		describe('filter hook', () => {
			it('synchronous, returns filtered source, loading stays false', async () => {
				const source = ['active', 'pending', 'inactive']
				const filterFn = vi.fn((src, params) => src.filter((s) => s !== params.exclude))

				const lookup = createLookup({ source, filter: filterFn })
				await lookup.fetch({ exclude: 'inactive' })
				flushSync()

				expect(filterFn).toHaveBeenCalledWith(source, { exclude: 'inactive' })
				expect(lookup.options).toEqual(['active', 'pending'])
				expect(lookup.loading).toBe(false)
			})

			it('empty result when no items match filter', async () => {
				const source = ['active', 'pending']
				const filterFn = (src) => src.filter((s) => s === 'unknown')

				const lookup = createLookup({ source, filter: filterFn })
				await lookup.fetch()
				flushSync()

				expect(lookup.options).toEqual([])
			})
		})

		describe('disabled state', () => {
			it('true when dependencies not met, options empty', async () => {
				const lookup = createLookup({
					url: '/api/cities?country={country}',
					dependsOn: ['country']
				})

				await lookup.fetch({})
				flushSync()

				expect(lookup.disabled).toBe(true)
				expect(lookup.options).toEqual([])
			})

			it('false after successful fetch with deps met', async () => {
				globalThis.fetch = vi.fn().mockResolvedValue({
					ok: true,
					json: () => Promise.resolve([{ id: 1, name: 'New York' }])
				})

				const lookup = createLookup({
					url: '/api/cities?country={country}',
					dependsOn: ['country']
				})

				await lookup.fetch({ country: 'USA' })
				flushSync()

				expect(lookup.disabled).toBe(false)
				expect(lookup.options.length).toBe(1)
			})

			it('reset() clears disabled to false', async () => {
				const lookup = createLookup({
					url: '/api/cities?country={country}',
					dependsOn: ['country']
				})

				await lookup.fetch({})
				flushSync()
				expect(lookup.disabled).toBe(true)

				lookup.reset()
				flushSync()
				expect(lookup.disabled).toBe(false)
			})
		})

		it('clearCache does not crash when config has no URL (fetch hook config)', () => {
			const mockFetchHook = vi.fn().mockResolvedValue([])
			const lookup = createLookup({ fetch: mockFetchHook })

			expect(() => lookup.clearCache()).not.toThrow()
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
