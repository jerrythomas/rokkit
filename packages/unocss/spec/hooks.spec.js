import { describe, it, expect } from 'vitest'
import { themeInitScript } from '../src/hooks.js'

/**
 * Flash-prevention script — mode resolution contract.
 *
 * The pre-paint script must turn a 'system' value (the canonical ColorMode term
 * used by ColorModeManager / ThemeSwitcherToggle) into a concrete light/dark
 * BEFORE first paint. The original script only special-cased the legacy 'auto'
 * alias, so a 'system' value — from defaultMode, a persisted store, or ?mode= —
 * leaked through and wrote an invalid `data-mode="system"`. These guards lock in
 * the unified resolver. (The script is a hand-inlined string, so — like the
 * themes coverage guard — we assert against the generated source.)
 */
describe('themeHook flash-prevention script — mode resolution', () => {
	it('resolves both "system" and "auto" to the OS preference in one place', () => {
		expect(themeInitScript()).toMatch(
			/if\(m==='system'\|\|m==='auto'\)m=matchMedia\('\(prefers-color-scheme:dark\)'\)/
		)
	})

	it('defaults to "system" when no defaultMode is configured (so the resolver runs)', () => {
		// omitted defaultMode → m falls back to 'system', which the resolver flips to light/dark
		expect(themeInitScript()).toContain("var m=qMode||t.mode||'system'")
	})

	it('honors an explicit light/dark defaultMode verbatim (no OS resolution)', () => {
		expect(themeInitScript({ defaultMode: 'light' })).toContain("||'light'")
		expect(themeInitScript({ defaultMode: 'dark' })).toContain("||'dark'")
	})

	it('accepts defaultMode:"system" and routes it through the resolver', () => {
		const s = themeInitScript({ defaultMode: 'system' })
		expect(s).toContain("||'system'")
		// regression: the old script special-cased only 'auto', leaking 'system' through as-is
		expect(s).not.toMatch(/if\(m==='auto'\)m=/)
	})

	it('keeps ?mode= query and persisted t.mode ahead of the default', () => {
		expect(themeInitScript()).toContain('var qMode=qs.get(\'mode\');')
		expect(themeInitScript()).toContain("var m=qMode||t.mode||")
	})
})
