/**
 * Coverage for src/index.ts and src/components/index.ts
 *
 * Barrel files only re-export — no logic. Just importing them is sufficient
 * to mark every line executed and hit 100% statement coverage.
 */
import { describe, it, expect } from 'vitest'

describe('app barrel exports', () => {
	it('exports ThemeSwitcherToggle from main index', async () => {
		const mod = await import('../src/index.js')
		expect(mod.ThemeSwitcherToggle).toBeDefined()
	})

	it('exports SkinSwitcherToggle from main index', async () => {
		const mod = await import('../src/index.js')
		expect(mod.SkinSwitcherToggle).toBeDefined()
	})

	it('exports TableOfContents from main index', async () => {
		const mod = await import('../src/index.js')
		expect(mod.TableOfContents).toBeDefined()
	})

	it('exports ColorModeManager from main index', async () => {
		const mod = await import('../src/index.js')
		expect(mod.ColorModeManager).toBeDefined()
	})

	it('exports resolveMode from main index', async () => {
		const mod = await import('../src/index.js')
		expect(mod.resolveMode).toBeDefined()
	})

	it('exports from components/index.ts', async () => {
		const mod = await import('../src/components/index.js')
		expect(mod.ThemeSwitcherToggle).toBeDefined()
		expect(mod.SkinSwitcherToggle).toBeDefined()
		expect(mod.TableOfContents).toBeDefined()
	})
})
