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
	it('ProgressBar track + fill have a background', () => {
		const c = css('base', 'progress')
		expect(c).toMatch(/\[data-progress\][\s\S]*?background:\s*var\(--/)
		expect(c).toMatch(/\[data-progress-bar\][\s\S]*?background:\s*var\(--primary/)
	})

	it('Pill has a surface + text color', () => {
		const c = css('base', 'pill')
		expect(c).toMatch(/\[data-pill\][\s\S]*?background:\s*var\(--/)
		expect(c).toMatch(/\[data-pill\][\s\S]*?color:\s*var\(--/)
	})

	it('Rating colors empty vs filled icons', () => {
		const c = css('base', 'rating')
		expect(c).toMatch(/\[data-rating-icon\][\s\S]*?color:\s*var\(--/)
		expect(c).toMatch(/\[data-filled\] \[data-rating-icon\][\s\S]*?color:\s*var\(--warning/)
	})

	it('Grid tiles + active state are colored', () => {
		const c = css('base', 'grid')
		expect(c).toMatch(/\[data-grid-item\][\s\S]*?color:\s*var\(--/)
		expect(c).toMatch(/\[data-grid-item\]\[data-active\][\s\S]*?var\(--primary/)
	})

	it('Tooltip bubble is colored (inverse)', () => {
		const c = css('base', 'tooltip')
		expect(c).toMatch(/\[data-tooltip-content\][\s\S]*?background:\s*var\(--ink/)
		expect(c).toMatch(/\[data-tooltip-content\][\s\S]*?color:\s*var\(--paper/)
	})

	it('Table focused row + TreeTable group row are distinguished', () => {
		const c = css('base', 'table')
		expect(c).toMatch(/\[data-focused\][\s\S]*?background:\s*var\(--/)
		expect(c).toMatch(/\[data-group\][\s\S]*?var\(--/)
	})

	it('Stepper check icon inherits its circle color', () => {
		expect(css('base', 'stepper')).toContain('[data-stepper-check-icon]')
	})

	it('PaletteManager has a base theme that is imported', () => {
		const pm = css('base', 'palette-manager')
		expect(pm).toContain('[data-palette-manager]')
		expect(pm).toMatch(/var\(--/)
		expect(css('base', 'index')).toContain('palette-manager.css')
	})
})
