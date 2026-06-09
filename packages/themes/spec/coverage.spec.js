import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Theme coverage guard.
 *
 * Components expose theming hooks (data-* parts, variants, states). A whole class
 * of bugs comes from theme CSS that covers SOME hooks but misses others — e.g.
 * the Toggle `button`/single variant was unthemed because every toggle.css only
 * targeted the group variant's `[data-toggle-option]`, leaving the single control
 * with no flipping color and no size.
 *
 * These assertions codify the audited coverage: for each fixed component, the
 * relevant theme CSS must target the hook. They read the SOURCE CSS (which is
 * what consumers import — `@rokkit/themes/*.css` maps to src/) so they don't
 * depend on a build step.
 */

const STYLES = ['rokkit', 'minimal', 'material', 'frosted', 'zen-sumi']
// vitest may run with cwd at the repo root or the themes project root — handle both.
const srcDir = [resolve(process.cwd(), 'src'), resolve(process.cwd(), 'packages/themes/src')].find(
	existsSync
)

/** Read a component CSS file for a layer ('base' or a style); '' if absent. */
function css(layer, comp) {
	const path = `${srcDir}/${layer}/${comp}.css`
	return existsSync(path) ? readFileSync(path, 'utf-8') : ''
}

/** Strip /* *​/ block comments so assertions match real CSS, not prose. */
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '')

describe('toggle — button/single variant is themed (variant-agnostic)', () => {
	it('base gives the button variant real control sizing', () => {
		const base = css('base', 'toggle')
		expect(base).toContain("[data-toggle][data-toggle-variant='button']")
		// sized per the option scale, not just the container padding
		expect(base).toMatch(/data-toggle-variant='button'\]\[data-toggle-size='md'\][\s\S]*?height/)
	})

	it.each(STYLES)('%s colors the button variant control', (style) => {
		const c = css(style, 'toggle')
		expect(c, `${style}/toggle.css must theme the button variant`).toContain(
			"[data-toggle-variant='button']"
		)
	})

	it.each(STYLES)('%s gives the button variant icon a (flipping) color', (style) => {
		const c = css(style, 'toggle')
		expect(c).toMatch(/data-toggle-variant='button'\] \[data-toggle-icon\][\s\S]*?text-ink/)
	})
})

/**
 * Base default colors (raw `var(--token)`) — these components were unthemed or
 * partially themed; base now gives them a visible, mode-flipping default so they
 * are never invisible (even under a style mismatch).
 */
describe('base default colors close the audited gaps', () => {
	it('refactored component colors are NOT in base (headless base)', () => {
		// base stays structure-only — no themed color tokens for these.
		expect(css('base', 'progress')).not.toMatch(/var\(--primary/)
		expect(css('base', 'pill')).not.toMatch(/var\(--ink\b/)
		expect(css('base', 'rating')).not.toMatch(/var\(--warning/)
		expect(css('base', 'grid')).not.toMatch(/color:\s*var\(--(ink|primary|paper-edge)/)
		expect(css('base', 'tooltip')).not.toMatch(/var\(--(ink|paper)/)
		expect(css('base', 'table')).not.toMatch(/data-focused|data-group/)
	})

	it('Stepper check icon inherits its circle color', () => {
		expect(css('base', 'stepper')).toContain('[data-stepper-check-icon]')
	})

	it('PaletteManager base is structural (no themed-color utilities), and imported', () => {
		const pm = css('base', 'palette-manager')
		expect(pm).toContain('[data-palette-manager]') // structure present
		expect(stripComments(pm)).not.toMatch(/@apply/) // color lives in the style layers, not base
		expect(css('base', 'index')).toContain('palette-manager.css')
	})
})

/**
 * Per-style coverage — the headless-base principle: color lives in EACH style, so a
 * style that forgets a component fails here (the gap is immediately actionable).
 * Extended per component as they move from base default → per-style.
 */
describe('per-style color coverage', () => {
	it.each(STYLES)('%s colors ProgressBar fill', (style) => {
		expect(css(style, 'progress')).toMatch(/\[data-progress-bar\][\s\S]*?bg-primary/)
	})
	it.each(STYLES)('%s colors Pill surface', (style) => {
		expect(css(style, 'pill')).toMatch(/\[data-pill\][\s\S]*?bg-/)
	})
	it.each(STYLES)('%s colors Rating filled icon', (style) => {
		expect(css(style, 'rating')).toMatch(/data-filled\] \[data-rating-icon\][\s\S]*?text-warning/)
	})
	it.each(STYLES)('%s colors Grid tiles + active', (style) => {
		const c = css(style, 'grid')
		expect(c).toMatch(/\[data-grid-item\][\s\S]*?(text-ink|border-paper)/)
		expect(c).toMatch(/data-grid-item\]\[data-active\][\s\S]*?(text-primary|border-primary)/)
	})
	it.each(STYLES)('%s colors Tooltip bubble', (style) => {
		expect(css(style, 'tooltip')).toMatch(/\[data-tooltip-content\][\s\S]*?bg-ink/)
	})
	it.each(STYLES)('%s distinguishes Table focused + group rows', (style) => {
		const c = css(style, 'table')
		expect(c).toMatch(/data-focused\][\s\S]*?bg-/)
		expect(c).toMatch(/data-group\][\s\S]*?bg-/)
	})
	it.each(STYLES)('%s colors PaletteManager', (style) => {
		const c = css(style, 'palette-manager')
		expect(c).toContain('[data-palette-manager]')
		expect(c).toMatch(/@apply [^}]*(bg-|text-|border-)/)
	})
})

/**
 * Consistent control-height scale — every trigger/text control sizes its height
 * from the shared, fixed --control-h-* tokens so same-size controls align.
 */
describe('control-height scale is shared + consistent', () => {
	it('density.css defines the fixed control-height tokens (rem)', () => {
		const d = css('base', 'density')
		expect(d).toMatch(/--control-h-sm:\s*1\.75rem/)
		expect(d).toMatch(/--control-h-md:\s*2\.25rem/)
		expect(d).toMatch(/--control-h-lg:\s*2\.75rem/)
	})
	it.each(['button', 'select', 'dropdown', 'menu', 'toggle'])(
		'%s sizes its control from --control-h-{sm,md,lg}',
		(comp) => {
			const c = css('base', comp)
			expect(c).toMatch(/height:\s*var\(--control-h-sm\)/)
			expect(c).toMatch(/height:\s*var\(--control-h-md\)/)
			expect(c).toMatch(/height:\s*var\(--control-h-lg\)/)
		}
	)
	it('Input aligns to the md control height', () => {
		expect(css('base', 'input')).toMatch(/min-height:\s*var\(--control-h-md\)/)
	})
	it('Switch bounding height uses the control scale per size', () => {
		const c = css('base', 'switch')
		expect(c).toMatch(/min-height:\s*var\(--control-h-sm\)/)
		expect(c).toMatch(/min-height:\s*var\(--control-h-md\)/)
		expect(c).toMatch(/min-height:\s*var\(--control-h-lg\)/)
	})
	it('Range aligns to the md control height', () => {
		expect(css('base', 'range')).toMatch(/\[data-range\][\s\S]*?height:\s*var\(--control-h-md\)/)
	})
	it('Pill aligns to the sm control rung', () => {
		expect(css('base', 'pill')).toMatch(/min-height:\s*var\(--control-h-sm\)/)
	})
	it('a control embedded in a form field fills it (no doubled height)', () => {
		expect(css('base', 'input')).toMatch(
			/\[data-input-root\] \[data-select\] \[data-select-trigger\][\s\S]*?height:\s*auto/
		)
	})
})
