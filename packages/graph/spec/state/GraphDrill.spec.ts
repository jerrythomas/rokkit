import { describe, it, expect, vi } from 'vitest'
import { flushSync } from 'svelte'
import { GraphState } from '../../src/GraphState.svelte.js'
import type { Cluster } from '../../src/layout/types.js'
import { CALL_FIELDS, nestedPath } from '../fixtures.js'

const FIELDS = { ...CALL_FIELDS, path: 'path', note: 'note' }
const make = (config = {}) =>
	new GraphState({ nodes: nestedPath.nodes, edges: nestedPath.edges, fields: FIELDS, layout: 'world', levels: 4, ...config })
const box = (s: GraphState, path: string) => s.clusters.find((c) => c.path?.join('/') === path) as Cluster
/** A promise the test settles by hand. */
function deferred() {
	let resolve!: () => void
	let reject!: (e: unknown) => void
	const promise = new Promise<void>((res, rej) => ((resolve = res), (reject = rej)))
	return { promise, resolve, reject }
}
const settle = () => new Promise((r) => setTimeout(r, 0))

describe('GraphDrill — where the reader is', () => {
	it('breadcrumbs are the root, then each segment of the drill path; the last is where you are', () => {
		const s = make({ focusPath: ['dbd', 'core'] })
		expect(s.drillPath).toEqual(['dbd', 'core'])
		expect(s.breadcrumbs).toEqual([
			{ path: [], label: null, current: false },
			{ path: ['dbd'], label: 'dbd', current: false },
			{ path: ['dbd', 'core'], label: 'core', current: true }
		])
	})

	it('at the root, the root crumb is the current one', () => {
		expect(make().breadcrumbs).toEqual([{ path: [], label: null, current: true }])
	})
})

describe('GraphDrill — what can be drilled', () => {
	it('a container can; a leaf only when the host loads levels; a pathless box never', () => {
		const s = make()
		expect(s.canDrill(box(s, 'dbd/core/lexer'))).toBe(true)
		expect(s.canDrill(box(s, 'dbd/core/lexer/parse'))).toBe(false)
		expect(s.canDrill(s.clusters.find((c) => c.name === 'orphan')!)).toBe(false)
		const loading = make({ ondrill: () => {} })
		expect(loading.canDrill(box(loading, 'dbd/core/lexer/parse'))).toBe(true)
	})

	it('only in a layout that reads focusPath', () => {
		const s = make({ layout: 'flow' })
		expect(s.canDrill({ name: 'x', path: ['dbd'], leaf: false } as Cluster)).toBe(false)
	})
})

describe('GraphDrill — drilling in and out', () => {
	it('drillInto moves the path, reports it with the declared node, and syncs the owner', () => {
		const ondrill = vi.fn()
		const onfocuspath = vi.fn()
		const s = make({ ondrill, onfocuspath })
		expect(s.drillInto(box(s, 'dbd/core/lexer'))).toBe(true)
		flushSync()
		expect(s.drillPath).toEqual(['dbd', 'core', 'lexer'])
		expect(ondrill).toHaveBeenCalledWith(['dbd', 'core', 'lexer'], expect.objectContaining({ id: 'mod_42' }))
		expect(onfocuspath).toHaveBeenCalledWith(['dbd', 'core', 'lexer'])
		expect(s.clusters.every((c) => c.path?.slice(0, 3).join('/') === 'dbd/core/lexer')).toBe(true)
	})

	it('passes a null node for a synthesised container', () => {
		const ondrill = vi.fn()
		const s = make({ ondrill })
		s.drillInto(box(s, 'dbd/core'))
		expect(ondrill).toHaveBeenCalledWith(['dbd', 'core'], null)
	})

	it('refuses a box it cannot drill, and firing nothing', () => {
		const ondrill = vi.fn()
		const s = make()
		expect(s.drillInto(box(s, 'dbd/core/lexer/parse'))).toBe(false)
		expect(s.drillPath).toEqual([])
		expect(ondrill).not.toHaveBeenCalled()
	})

	it('drillOut climbs and reports the new path; at the root it does nothing', () => {
		const ondrillup = vi.fn()
		const s = make({ focusPath: ['dbd', 'core', 'lexer'], ondrillup })
		expect(s.drillOut()).toBe(true)
		expect(ondrillup).toHaveBeenLastCalledWith(['dbd', 'core'])
		expect(s.drillOut(5)).toBe(true)
		expect(s.drillPath).toEqual([])
		expect(ondrillup).toHaveBeenLastCalledWith([])
		expect(s.drillOut()).toBe(false)
		expect(ondrillup).toHaveBeenCalledTimes(2)
	})

	it('drillTo jumps up to an ancestor — a breadcrumb — and nowhere else', () => {
		const ondrillup = vi.fn()
		const s = make({ focusPath: ['dbd', 'core', 'lexer'], ondrillup })
		expect(s.drillTo(['dbd'])).toBe(true)
		expect(ondrillup).toHaveBeenCalledWith(['dbd'])
		expect(s.drillTo(['dbd', 'site'])).toBe(false)
		expect(s.drillTo(['dbd'])).toBe(false)
	})

	it('leaves the selection alone — drilling is not selecting', () => {
		const onselect = vi.fn()
		const s = make({ onselect })
		s.select('mod_42')
		s.drillInto(box(s, 'dbd/core/lexer'))
		s.drillOut()
		expect(s.value).toBe('mod_42')
		expect(onselect).toHaveBeenCalledTimes(1)
	})
})

describe('GraphDrill — a host that loads asynchronously', () => {
	it('is pending until the returned promise settles', async () => {
		const load = deferred()
		const s = make({ ondrill: () => load.promise })
		s.drillInto(box(s, 'dbd/core/lexer'))
		expect(s.pending).toBe(true)
		load.resolve()
		await settle()
		expect(s.pending).toBe(false)
		expect(s.drillPath).toEqual(['dbd', 'core', 'lexer'])
	})

	it('is not pending for a host that answers synchronously', () => {
		const s = make({ ondrill: () => undefined })
		s.drillInto(box(s, 'dbd/core'))
		expect(s.pending).toBe(false)
	})

	it('lets only the LATEST drill settle it — an older load finishing late changes nothing', async () => {
		const first = deferred()
		const second = deferred()
		const loads = [first, second]
		const s = make({ ondrill: () => loads.shift()!.promise })
		s.drillInto(box(s, 'dbd/core'))
		s.drillInto(box(s, 'dbd/core/lexer'))
		first.resolve()
		await settle()
		expect(s.pending).toBe(true)
		first.reject?.(new Error('late'))
		second.resolve()
		await settle()
		expect([s.pending, s.drillError]).toEqual([false, null])
		expect(s.drillPath).toEqual(['dbd', 'core', 'lexer'])
	})

	it('a failed load restores the previous level, reports the error, and syncs the owner', async () => {
		const load = deferred()
		const onfocuspath = vi.fn()
		const s = make({ focusPath: ['dbd'], ondrill: () => load.promise, onfocuspath })
		s.drillInto(box(s, 'dbd/core'))
		const failure = new Error('fetch failed')
		load.reject(failure)
		await settle()
		expect([s.pending, s.drillError, s.drillPath]).toEqual([false, failure, ['dbd']])
		expect(onfocuspath).toHaveBeenLastCalledWith(['dbd'])
	})

	it('treats a handler that throws like a failed load, and clears the error on the next drill', () => {
		const s = make({
			ondrill: (path: string[]) => {
				if (path.at(-1) === 'core') throw new Error('boom')
			}
		})
		s.drillInto(box(s, 'dbd/core'))
		expect(s.drillPath).toEqual([])
		expect((s.drillError as Error).message).toBe('boom')
		s.drillInto(box(s, 'dbd'))
		expect(s.drillError).toBeNull()
	})

	it('a drill up while a load is pending supersedes it', async () => {
		const load = deferred()
		const s = make({ ondrill: () => load.promise })
		s.drillInto(box(s, 'dbd/core'))
		s.drillOut()
		expect(s.pending).toBe(false)
		load.reject(new Error('too late'))
		await settle()
		expect([s.drillError, s.drillPath]).toEqual([null, ['dbd']])
	})
})
