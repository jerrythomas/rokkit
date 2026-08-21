import { describe, it, expect, beforeEach } from 'vitest'
import {
	fontCatalogs,
	FONT_VAR,
	fontStack,
	wizardState,
	savePreset,
	resetPreset,
	exportTokensCss,
	type FontRole
} from '../../src/lib/koan/demos/theme-wizard/store.svelte'

/**
 * Theme wizard step 03 (Typography) — the font selection → live preview → export path.
 *
 * The wizard applies a choice by writing `fontStack(role)` into `--font-{role}` on
 * `document.documentElement`, and writes the same stack into the exported `tokens.css`.
 * Both read through `fontStack`, so these tests pin that resolution plus the two
 * consumers, and the fallback guarantee the catalog depends on.
 */

const ROLES: FontRole[] = ['display', 'ui', 'mono']

// Mirrors the store's own (unexported) constant.
const STORAGE_KEY = 'rokkit-demo.theme-wizard-preset'

// Generic CSS families a stack may legitimately end on. If a stack ends on a *named*
// face instead, a user without that face installed gets the browser default — which is
// the "graceful system fallback" criterion failing silently.
const GENERIC_FAMILIES = [
	'serif',
	'sans-serif',
	'monospace',
	'cursive',
	'fantasy',
	'system-ui',
	'ui-serif',
	'ui-sans-serif',
	'ui-monospace'
]

beforeEach(() => {
	resetPreset()
})

describe('font catalogs', () => {
	it('offers choices for every role', () => {
		expect(ROLES.length).toBe(3)
		for (const role of ROLES) {
			expect(fontCatalogs[role].length).toBeGreaterThan(1)
		}
	})

	it('every stack ends on a generic family, so an unavailable face still falls back', () => {
		// The acceptance criterion "graceful system fallback" lives here: a catalog entry
		// like "'Fraunces'" with no fallback would render as the browser default for
		// anyone without it. Asserted per entry rather than spot-checked.
		const checked: string[] = []
		for (const role of ROLES) {
			for (const choice of fontCatalogs[role]) {
				const last = choice.stack.split(',').pop()!.trim().replace(/['"]/g, '')
				expect(GENERIC_FAMILIES, `${role}/${choice.id} → "${last}"`).toContain(last)
				checked.push(`${role}/${choice.id}`)
			}
		}
		// Non-empty, or the loop above asserts nothing.
		expect(checked.length).toBeGreaterThanOrEqual(10)
	})

	it('uses unique ids within a role, so a pick cannot be ambiguous', () => {
		for (const role of ROLES) {
			const ids = fontCatalogs[role].map((c) => c.id)
			expect(new Set(ids).size).toBe(ids.length)
		}
	})

	it('defaults to a real catalog entry for every role', () => {
		for (const role of ROLES) {
			const id = wizardState.fonts[role]
			expect(fontCatalogs[role].some((c) => c.id === id)).toBe(true)
		}
	})
})

describe('fontStack — what the preview and the export both read', () => {
	it('resolves the chosen id to its stack', () => {
		const target = fontCatalogs.ui.find((c) => c.id !== wizardState.fonts.ui)!
		wizardState.fonts.ui = target.id
		expect(fontStack('ui')).toBe(target.stack)
	})

	it('returns a different stack when the choice changes', () => {
		// A resolver hardwired to one entry would pass a single-value assertion.
		const [first, second] = fontCatalogs.display
		wizardState.fonts.display = first.id
		const a = fontStack('display')
		wizardState.fonts.display = second.id
		const b = fontStack('display')
		expect(a).toBe(first.stack)
		expect(b).toBe(second.stack)
		expect(a).not.toBe(b)
	})

	it('falls back to the first entry for an unknown id rather than returning undefined', () => {
		wizardState.fonts.mono = 'not-a-font'
		expect(fontStack('mono')).toBe(fontCatalogs.mono[0].stack)
	})
})

describe('export — the chosen font reaches tokens.css', () => {
	it('writes the selected stack under the role variable', () => {
		const target = fontCatalogs.display.find((c) => c.id !== wizardState.fonts.display)!
		wizardState.fonts.display = target.id

		const css = exportTokensCss()
		expect(css).toContain(`${FONT_VAR.display}: ${target.stack}`)
		// Labelled, so the exported file says which face was picked.
		expect(css).toContain(target.label)
	})

	it('replaces the previous choice rather than emitting both', () => {
		const [first, second] = fontCatalogs.ui
		wizardState.fonts.ui = first.id
		expect(exportTokensCss()).toContain(`${FONT_VAR.ui}: ${first.stack}`)

		wizardState.fonts.ui = second.id
		const css = exportTokensCss()
		expect(css).toContain(`${FONT_VAR.ui}: ${second.stack}`)
		expect(css).not.toContain(`${FONT_VAR.ui}: ${first.stack}`)
	})

	it('emits all three role variables inside :root', () => {
		const css = exportTokensCss()
		const root = css.slice(css.indexOf(':root {'), css.indexOf('}'))
		for (const role of ROLES) {
			expect(root).toContain(FONT_VAR[role])
		}
	})
})

describe('persistence — a font choice survives a reload', () => {
	it('round-trips every role through savePreset', () => {
		const picks: Record<string, string> = {}
		for (const role of ROLES) {
			const target = fontCatalogs[role].find((c) => c.id !== wizardState.fonts[role])!
			wizardState.fonts[role] = target.id
			picks[role] = target.id
		}
		savePreset()

		const raw = localStorage.getItem(STORAGE_KEY)
		expect(raw).toBeTruthy()
		const parsed = JSON.parse(raw!) as { fonts: Record<string, string> }
		for (const role of ROLES) {
			expect(parsed.fonts[role]).toBe(picks[role])
		}
	})

	it('resetPreset restores the defaults and clears storage', () => {
		wizardState.fonts.ui = fontCatalogs.ui[fontCatalogs.ui.length - 1].id
		savePreset()
		expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy()

		resetPreset()
		expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
		for (const role of ROLES) {
			expect(fontCatalogs[role].some((c) => c.id === wizardState.fonts[role])).toBe(true)
		}
	})
})
