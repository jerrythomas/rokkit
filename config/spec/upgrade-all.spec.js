/* `upgrade:all` moves every dependency to its latest major — except the ones held back, each
 * with a recorded reason (#156 §4: TypeScript 7 makes svelte-check refuse to start).
 */
import { describe, it, expect } from 'vitest'
import { HOLDS, upgradeTargets } from '../upgrade-all.mjs'

const manifest = {
	dependencies: { '@rokkit/core': 'workspace:*', ramda: '^0.32.0' },
	devDependencies: { typescript: '^5.9.3', vitest: '^4.1.11', '@rokkit/helpers': 'workspace:latest' },
	peerDependencies: { svelte: '^5.0.0' },
	optionalDependencies: { shiki: '^3.23.0' }
}

describe('upgradeTargets', () => {
	it('names every dependency to move to latest, workspace links and held ones excepted', () => {
		expect(upgradeTargets(manifest).sort()).toEqual(['ramda', 'shiki', 'vitest'])
	})

	it('leaves peers alone — a peer range is a promise to consumers, not a pin', () => {
		expect(upgradeTargets(manifest)).not.toContain('svelte')
	})

	it('is empty for a manifest with nothing to move', () => {
		expect(upgradeTargets({})).toEqual([])
		expect(upgradeTargets({ dependencies: { '@rokkit/core': 'workspace:*' } })).toEqual([])
	})
})

describe('HOLDS', () => {
	it('holds TypeScript below 7, with the reason written down', () => {
		expect(HOLDS.typescript).toMatch(/svelte-check/)
		expect(HOLDS.typescript).toMatch(/#156/)
	})
})
