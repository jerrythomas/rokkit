/* #164 — a share (0..1) per box of the containment tree. A leaf has its own; a container's is
 * the size-weighted mean of what it holds, unless it declares one; nothing measured is no share.
 */
import { describe, it, expect } from 'vitest'
import { normalizeGraph } from '../../src/model/normalize.js'
import { buildTree, findNode } from '../../src/model/tree.js'
import { shares } from '../../src/model/share.js'

const files = [
	{ id: 'a', path: ['ui', 'a'], measures: { size: 30, tested: 1 } },
	{ id: 'b', path: ['ui', 'b'], measures: { size: 10, tested: 0 } },
	{ id: 'c', path: ['core', 'c'], measures: { size: 5 } },
	{ id: 'd', path: ['core', 'd'], measures: { size: 5 } }
]
const treeOf = (nodes: unknown[]) => buildTree(normalizeGraph(nodes, [], {}), { measure: 'size' })
const shareAt = (nodes: unknown[], path: string[]) => {
	const tree = treeOf(nodes)
	return shares(tree, 'tested').get(findNode(tree, path)!.id)
}

describe('shares', () => {
	it('gives a leaf its own share', () => {
		expect(shareAt(files, ['ui', 'a'])).toBe(1)
		expect(shareAt(files, ['ui', 'b'])).toBe(0)
	})

	it('gives a container the size-weighted mean of its children — a share does not sum', () => {
		// 30 tested of 40 by size: 0.75, where a plain mean of 1 and 0 would say 0.5.
		expect(shareAt(files, ['ui'])).toBe(0.75)
	})

	it('leaves a box with nothing measured beneath it without a share — not a zero', () => {
		expect(shareAt(files, ['core'])).toBeUndefined()
		expect(shareAt(files, ['core', 'c'])).toBeUndefined()
	})

	it('skips the unmeasured children of a container rather than counting them as zero', () => {
		const mixed = [...files, { id: 'e', path: ['core', 'e'], measures: { size: 5, tested: 0.5 } }]
		expect(shareAt(mixed, ['core'])).toBe(0.5)
	})

	it('lets a container keep a share it declares — the host may know better', () => {
		const declared = [...files, { id: 'ui', path: ['ui'], measures: { tested: 0.1 } }]
		expect(shareAt(declared, ['ui'])).toBe(0.1)
	})

	it('falls back to a plain mean where the children have no size to weigh by', () => {
		const flat = [
			{ id: 'x', path: ['p', 'x'], measures: { tested: 1 } },
			{ id: 'y', path: ['p', 'y'], measures: { tested: 0 } }
		]
		expect(shareAt(flat, ['p'])).toBe(0.5)
	})

	it('keeps a share inside 0..1', () => {
		const wild = [
			{ id: 'x', path: ['p', 'x'], measures: { size: 1, tested: 4 } },
			{ id: 'y', path: ['p', 'y'], measures: { size: 1, tested: -2 } }
		]
		expect(shareAt(wild, ['p', 'x'])).toBe(1)
		expect(shareAt(wild, ['p', 'y'])).toBe(0)
	})
})
