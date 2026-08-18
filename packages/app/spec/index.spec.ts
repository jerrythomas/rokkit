/**
 * Coverage for src/index.ts and src/components/index.ts
 *
 * Barrel files only re-export — no logic. Just importing them is sufficient
 * to mark every line executed and hit 100% statement coverage.
 *
 * The barrels pull in the whole @rokkit/app surface, so the FIRST dynamic
 * import transforms a large module graph. Under full-suite collect load that
 * cold import can exceed the default 5s per-test timeout (it passes in ~1.5s in
 * isolation) — a flake. Warm both barrels once in `beforeAll` with a generous
 * timeout, then each test asserts against the cached module, so the individual
 * tests are trivially fast and deterministic regardless of collect pressure.
 */
import { describe, it, expect, beforeAll } from 'vitest'

let index: typeof import('../src/index.js')
let components: typeof import('../src/components/index.js')

beforeAll(async () => {
	index = await import('../src/index.js')
	components = await import('../src/components/index.js')
}, 30000)

describe('app barrel exports', () => {
	it('exports ThemeSwitcherToggle from main index', () => {
		expect(index.ThemeSwitcherToggle).toBeDefined()
	})

	it('exports SkinSwitcherToggle from main index', () => {
		expect(index.SkinSwitcherToggle).toBeDefined()
	})

	it('exports TableOfContents from main index', () => {
		expect(index.TableOfContents).toBeDefined()
	})

	it('exports ColorModeManager from main index', () => {
		expect(index.ColorModeManager).toBeDefined()
	})

	it('exports resolveMode from main index', () => {
		expect(index.resolveMode).toBeDefined()
	})

	it('exports from components/index.ts', () => {
		expect(components.ThemeSwitcherToggle).toBeDefined()
		expect(components.SkinSwitcherToggle).toBeDefined()
		expect(components.TableOfContents).toBeDefined()
	})
})
