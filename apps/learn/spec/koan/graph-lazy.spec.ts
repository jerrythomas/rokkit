/* The lazy codebase host — the demo's answer to #165: it holds ONE level at a time and fetches
 * the next when the reader drills, so the treemap never has the whole repo loaded.
 */
import { describe, it, expect } from 'vitest'
import { LazyCodebase } from '../../src/lib/koan/demos/graph/lazy-codebase.svelte'

type Row = { id: string; path: string[] }
const ALL: Row[] = [
	{ id: 'a', path: ['rokkit', 'ui', 'List.svelte'] },
	{ id: 'b', path: ['rokkit', 'ui', 'lib', 'mapper.js'] },
	{ id: 'c', path: ['rokkit', 'ui', 'lib', 'deep', 'far.js'] },
	{ id: 'd', path: ['rokkit', 'chart', 'Plot.svelte'] },
	{ id: 'e', path: ['other', 'x.js'] }
]
const ids = (rows: unknown[]) => (rows as Row[]).map((r) => r.id).sort()

describe('LazyCodebase', () => {
	it('starts with the opening level already loaded — no fetch for the first picture', () => {
		const host = new LazyCodebase(ALL, { root: ['rokkit'], depth: 2, delay: 5 })
		expect(ids(host.nodes)).toEqual(['a', 'd'])
		expect(host.fetches).toBe(0)
	})

	it('fetches a level it has not seen, asynchronously, and swaps it in', async () => {
		const host = new LazyCodebase(ALL, { root: ['rokkit'], depth: 2, delay: 5 })
		const pending = host.load(['rokkit', 'ui'])
		expect(pending).toBeInstanceOf(Promise)
		expect(ids(host.nodes)).toEqual(['a', 'd'])
		await pending
		expect(ids(host.nodes)).toEqual(['a', 'b'])
		expect(host.fetches).toBe(1)
	})

	it('answers a level it already has synchronously — drilling back up is not a refetch', async () => {
		const host = new LazyCodebase(ALL, { root: ['rokkit'], depth: 2, delay: 5 })
		await host.load(['rokkit', 'ui'])
		expect(host.load(['rokkit'])).toBeUndefined()
		expect(ids(host.nodes)).toEqual(['a', 'd'])
		expect(host.load(['rokkit', 'ui'])).toBeUndefined()
		expect(host.fetches).toBe(1)
	})
})
