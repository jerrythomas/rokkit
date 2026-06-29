import { describe, it, expect } from 'vitest'
import { themeInitScript, themeHook } from '../src/hooks.js'

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

describe('themeInitScript — density and radius defaults', () => {
	it('uses custom defaultDensity when provided', () => {
		const s = themeInitScript({ defaultDensity: 'compact' })
		expect(s).toContain("'compact'")
	})

	it('uses custom defaultRadius when provided', () => {
		const s = themeInitScript({ defaultRadius: 'rounded' })
		expect(s).toContain("'rounded'")
	})
})

describe('themeHook — SvelteKit handle factory', () => {
	it('returns a function (SvelteKit handle)', () => {
		const handle = themeHook()
		expect(typeof handle).toBe('function')
	})

	it('calls resolve with a transformPageChunk that injects the script after <body>', async () => {
		const handle = themeHook()
		const html = '<html><head></head><body data-sveltekit-preload-data="hover"><h1>Hi</h1></body></html>'
		const resolve = vi.fn((_event, opts) => {
			const transformed = opts.transformPageChunk({ html })
			return Promise.resolve({ text: async () => transformed })
		})

		await handle({ event: {}, resolve })

		expect(resolve).toHaveBeenCalledOnce()
		const [, opts] = resolve.mock.calls[0]
		expect(typeof opts.transformPageChunk).toBe('function')

		const result = await resolve.mock.results[0].value
		const text = await result.text()
		// The script should be injected right after the opening <body> tag
		expect(text).toContain('<body data-sveltekit-preload-data="hover"><script>')
	})

	it('embeds custom storageKey option in the injected script', async () => {
		const handle = themeHook({ storageKey: 'my-app-theme' })
		let capturedHtml = ''
		const resolve = vi.fn((_event, opts) => {
			const html = '<html><body></body></html>'
			capturedHtml = opts.transformPageChunk({ html })
			return Promise.resolve()
		})

		await handle({ event: {}, resolve })
		expect(capturedHtml).toContain("'my-app-theme'")
	})

	it('embeds defaultStyle when provided', async () => {
		const handle = themeHook({ defaultStyle: 'rokkit' })
		let capturedHtml = ''
		const resolve = vi.fn((_event, opts) => {
			const html = '<html><body></body></html>'
			capturedHtml = opts.transformPageChunk({ html })
			return Promise.resolve()
		})

		await handle({ event: {}, resolve })
		expect(capturedHtml).toContain("'rokkit'")
	})
})
