import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
	DEFAULT_HEADINGS,
	HEADING_LEVELS,
	HEADING_WEIGHTS,
	headingRules,
	stepHeadingSize,
	setHeadingWeight,
	wizardState,
	savePreset,
	resetPreset,
	exportTokensCss
} from '../../src/lib/koan/demos/theme-wizard/store.svelte'

/**
 * Theme wizard step 03 — heading levels (#152). A level is styled by a `[data-heading]` rule,
 * not by one-property tokens, so the wizard edits and exports RULES: the live preview, the
 * saved preset and `tokens.css` all carry the same `[data-heading='N'], [data-prose] hN` text.
 */
const STORAGE_KEY = 'rokkit-demo.theme-wizard-preset'

beforeEach(() => {
	localStorage.clear()
	resetPreset()
})

describe('heading defaults', () => {
	it('are exactly the theme’s own [data-heading] defaults — the guides’ scale', () => {
		const css = readFileSync(join(process.cwd(), 'packages/themes/src/base/heading.css'), 'utf-8')
		for (const level of HEADING_LEVELS) {
			const rule = css.match(new RegExp(`\\[data-heading='${level}'\\][^{]*\\{([^}]*)\\}`))?.[1] ?? ''
			expect(rule, level).toContain(`font-size: ${DEFAULT_HEADINGS[level].size}px`)
			expect(rule, level).toContain(`font-weight: ${DEFAULT_HEADINGS[level].weight}`)
		}
	})
})

describe('editing a level', () => {
	it('steps the size by half a pixel, inside sane bounds', () => {
		stepHeadingSize('2', 1)
		expect(wizardState.headings['2'].size).toBe(18.5)
		stepHeadingSize('2', -2)
		expect(wizardState.headings['2'].size).toBe(17.5)
		for (let i = 0; i < 200; i++) stepHeadingSize('4', -1)
		expect(wizardState.headings['4'].size).toBe(10)
		for (let i = 0; i < 200; i++) stepHeadingSize('1', 1)
		expect(wizardState.headings['1'].size).toBe(64)
	})

	it('sets a weight from the offered set only', () => {
		setHeadingWeight('1', 500)
		expect(wizardState.headings['1'].weight).toBe(500)
		setHeadingWeight('1', 123 as never)
		expect(wizardState.headings['1'].weight).toBe(500)
		expect(HEADING_WEIGHTS).toEqual([400, 500, 600, 700])
	})
})

describe('headingRules', () => {
	it('is one rule per level, for the attribute and for prose headings', () => {
		const css = headingRules()
		for (const level of HEADING_LEVELS) {
			expect(css).toContain(`[data-heading='${level}'], [data-prose] h${level} {`)
		}
		expect(css).toContain('font-size: 28px; font-weight: 700;')
	})

	it('follows an edit', () => {
		stepHeadingSize('3', 2)
		expect(headingRules()).toContain("[data-heading='3'], [data-prose] h3 { font-size: 15.5px; font-weight: 600; }")
	})
})

describe('persistence and export', () => {
	it('saves and restores the levels with the preset; reset brings the defaults back', () => {
		setHeadingWeight('2', 700)
		savePreset()
		const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
		expect(stored.headings['2']).toEqual({ size: 18, weight: 700 })
		resetPreset()
		expect(wizardState.headings).toEqual(DEFAULT_HEADINGS)
	})

	it('exports the heading rules into tokens.css, after the token blocks', () => {
		stepHeadingSize('1', 4)
		const css = exportTokensCss()
		expect(css).toContain("[data-heading='1'], [data-prose] h1 { font-size: 30px; font-weight: 700; }")
		expect(css.indexOf('[data-heading')).toBeGreaterThan(css.indexOf('[data-mode="dark"]'))
	})
})
