/* The last gate before npm: a packed manifest must pin its @rokkit siblings to the release
 * being published (v1.8.1 shipped them pinned to 1.8.0). */
import { describe, it, expect } from 'vitest'
import { stalePins } from '../check-pins.mjs'

describe('stalePins', () => {
	it('is empty when every @rokkit dependency is the release version', () => {
		const manifest = { version: '1.8.2', dependencies: { '@rokkit/core': '1.8.2', marked: '^15.0.0' }, peerDependencies: { '@rokkit/ui': '1.8.2' } }
		expect(stalePins(manifest)).toEqual([])
	})

	it('names every sibling pinned to another version, in any dependency section', () => {
		const manifest = {
			version: '1.8.1',
			dependencies: { '@rokkit/states': '1.8.0', '@rokkit/core': '1.8.1' },
			peerDependencies: { '@rokkit/ui': '^1.7.0' }
		}
		expect(stalePins(manifest)).toEqual(['@rokkit/states@1.8.0', '@rokkit/ui@^1.7.0'])
	})

	it('leaves a dist-tag like latest alone, and ignores third-party packages', () => {
		expect(stalePins({ version: '1.8.2', dependencies: { '@rokkit/core': 'latest', svelte: '5.0.0' } })).toEqual([])
	})
})
