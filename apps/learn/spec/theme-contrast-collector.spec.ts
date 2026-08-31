import { describe, it, expect } from 'vitest'
import {
	matrix,
	mergeFinding,
	where,
	isAllowed,
	formatReport,
	STYLES,
	MODES,
	SKINS
} from '../e2e/contrast-collector.mjs'

// Unit coverage for the Node-side (non-browser) helpers of the theme-contrast
// audit, extracted from auditGallery during the qlty complexity refactor.
// `collectContrast` runs in the browser (canvas + getComputedStyle) and is
// verified separately by the theme-contrast e2e.

describe('matrix', () => {
	it('is the full skin × style × mode product', () => {
		expect(matrix()).toHaveLength(SKINS.length * STYLES.length * MODES.length)
	})
	it('iterates skin → style → mode (mode innermost)', () => {
		const m = matrix()
		expect(m[0]).toEqual({ style: STYLES[0], mode: MODES[0], skin: SKINS[0] })
		expect(m[1]).toEqual({ style: STYLES[0], mode: MODES[1], skin: SKINS[0] })
		// after both modes of the first style, the style advances (skin fixed)
		expect(m[2]).toEqual({ style: STYLES[1], mode: MODES[0], skin: SKINS[0] })
	})
	it('every config carries a valid style, mode, and skin', () => {
		for (const c of matrix()) {
			expect(STYLES).toContain(c.style)
			expect(MODES).toContain(c.mode)
			expect(SKINS).toContain(c.skin)
		}
	})
})

describe('mergeFinding', () => {
	const finding = (over = {}) => ({ comp: 'Button', part: 'data-x', text: 'Go', ratio: 4.0, ...over })

	it('seeds a new entry with the config in a fresh configs array', () => {
		const uniq = new Map()
		mergeFinding(uniq, finding(), 'rokkit/light/default')
		const entry = uniq.get('Button|data-x|idle|Go')
		expect(entry.configs).toEqual(['rokkit/light/default'])
		expect(entry.ratio).toBe(4.0)
	})

	it('appends the config on a repeat sighting and keeps the WORST (lowest) ratio', () => {
		const uniq = new Map()
		mergeFinding(uniq, finding({ ratio: 4.0 }), 'a')
		mergeFinding(uniq, finding({ ratio: 3.2 }), 'b')
		const entry = uniq.get('Button|data-x|idle|Go')
		expect(entry.configs).toEqual(['a', 'b'])
		expect(entry.ratio).toBe(3.2)
	})

	it('does not raise the ratio when a later sighting is higher', () => {
		const uniq = new Map()
		mergeFinding(uniq, finding({ ratio: 3.2 }), 'a')
		mergeFinding(uniq, finding({ ratio: 4.9 }), 'b')
		expect(uniq.get('Button|data-x|idle|Go').ratio).toBe(3.2)
	})

	it('keys distinct comp/part/text as separate entries', () => {
		const uniq = new Map()
		mergeFinding(uniq, finding(), 'a')
		mergeFinding(uniq, finding({ part: 'data-y' }), 'a')
		expect(uniq.size).toBe(2)
	})

	it('keeps the same part distinct per interaction state', () => {
		// The resting and hovered forms of one part are different defects with
		// different fixes, so collapsing them would hide one behind the other.
		const uniq = new Map()
		mergeFinding(uniq, finding({ state: 'idle', ratio: 4.0 }), 'a')
		mergeFinding(uniq, finding({ state: 'hover', ratio: 2.1 }), 'a')
		expect(uniq.size).toBe(2)
		expect(uniq.get('Button|data-x|hover|Go').ratio).toBe(2.1)
		expect(uniq.get('Button|data-x|idle|Go').ratio).toBe(4.0)
	})

	it("treats a finding with no state as 'idle'", () => {
		const uniq = new Map()
		mergeFinding(uniq, finding(), 'a')
		expect([...uniq.keys()]).toEqual(['Button|data-x|idle|Go'])
	})
})

describe('where', () => {
	it('collapses configs to style/mode pairs with a skin count', () => {
		expect(where(['rokkit/dark/default', 'rokkit/dark/ocean', 'minimal/light/rose']))
			.toBe('minimal/light×1 rokkit/dark×2')
	})

	it('is empty for no configs', () => {
		expect(where([])).toBe('')
		expect(where()).toBe('')
	})
})

describe('isAllowed', () => {
	it('returns false with the (empty) accept-list', () => {
		expect(isAllowed({ comp: 'Button', part: 'data-x', text: 'Go' })).toBe(false)
	})
})

describe('formatReport', () => {
	it('reports success when there are no failures', () => {
		const md = formatReport([], 'http://localhost:4173')
		expect(md).toContain('✅ No contrast failures.')
	})

	it('renders a per-component table for failures', () => {
		const rows = [
			{ comp: 'Button', part: 'data-x', text: 'Go', ratio: 3.1, threshold: 4.5, px: 14, weight: 400, fg: 'rgb(0,0,0)', bg: 'rgb(20,20,20)', configs: ['rokkit/dark/default'] }
		]
		const md = formatReport(rows, 'http://localhost:4173')
		expect(md).toContain('1 unique failures')
		expect(md).toContain('### Button')
		expect(md).toContain('`data-x`')
		expect(md).toContain('3.1')
	})
})
