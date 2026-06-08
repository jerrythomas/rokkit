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
