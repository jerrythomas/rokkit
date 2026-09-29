/* An option object that quietly drops what it does not know is worse than one that rejects
   it: the caller gets a correct-LOOKING diagram and no way to tell "this layout ignored
   depth" from "depth worked and this is two hops" (#162).
   
   TypeScript does not catch it. Excess-property checking only fires on an object literal at
   the call site, so `neighborhood(model, opts)` with an extra key on `opts` type-checks. */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cluster, neighborhood, points } from '../../src/layout/index.js'
import { LAYOUT_OPTION_KEYS, resetOptionWarnings } from '../../src/layout/options.js'
import { normalizeGraph } from '../../src/model/normalize.js'
import type { GraphFields } from '../../src/types.js'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const FIELDS: GraphFields = { source: 'source', target: 'target' }
const model = () =>
	normalizeGraph(
		[{ id: 'a', group: 'g' }, { id: 'b', group: 'g' }],
		[{ source: 'a', target: 'b' }],
		FIELDS
	)

let warn: ReturnType<typeof vi.spyOn>

beforeEach(() => {
	resetOptionWarnings()
	warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(() => warn.mockRestore())

describe('unknown layout options', () => {
	it('warns instead of silently discarding', () => {
		neighborhood(model(), { focus: 'a', depth: 2 } as never)

		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn.mock.calls[0][0]).toContain('depth')
	})

	it('names the layout that ignored it, since the option may be valid elsewhere', () => {
		cluster(model(), { nope: 1 } as never)

		expect(warn.mock.calls[0][0]).toContain('cluster')
	})

	it('lists what IS accepted, so the warning is actionable', () => {
		points(model(), { nope: 1 } as never)

		for (const key of LAYOUT_OPTION_KEYS) expect(warn.mock.calls[0][0]).toContain(key)
	})

	it('warns ONCE per key — a layout re-runs on every render', () => {
		for (let i = 0; i < 5; i++) cluster(model(), { nope: 1 } as never)

		expect(warn).toHaveBeenCalledTimes(1)
	})

	it('stays quiet for every option the type actually defines', () => {
		cluster(model(), { density: 'full', arrange: 'a-z', groupBy: 'kind', edgeStyle: 'curved' })
		neighborhood(model(), { focus: 'a', expanded: new Set(['a']) })

		expect(warn).not.toHaveBeenCalled()
	})

	it('says nothing in production — this is a development aid', () => {
		// A library warning on every consumer's production console is noise they cannot act on.
		const original = process.env.NODE_ENV
		process.env.NODE_ENV = 'production'
		try {
			cluster(model(), { nope: 1 } as never)
			expect(warn).not.toHaveBeenCalled()
		} finally {
			process.env.NODE_ENV = original
		}
	})

	it('keeps the known-key list in step with the type', () => {
		// A key added to LayoutOptions but missed here would warn about a LEGITIMATE option,
		// which is worse than the silence this replaced.
		const source = readFileSync(
			join(process.cwd(), 'packages/graph/src/layout/types.ts'),
			'utf-8'
		)
		const block = source.match(/export type LayoutOptions = \{([\s\S]*?)\n\}/)![1]
		const declared = [...block.matchAll(/^\t(\w+)\??:/gm)].map((m) => m[1])

		expect([...LAYOUT_OPTION_KEYS].sort()).toEqual(declared.sort())
	})
})
