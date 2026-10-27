/* #173 — a zen-sumi Switch that is OFF must be visible: its track cannot share a tone with the
 * page (paper) or with its own thumb. The off track was paper-mute under a paper thumb on a paper
 * page, three near-identical tones (measured L 0.955 / 0.985 / 0.985 on the live demo). */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const read = (p) =>
	readFileSync(join(process.cwd(), 'packages/themes/src', p), 'utf-8').replace(
		/\/\*[\s\S]*?\*\//g,
		''
	)

/** The `bg-*` named token applied by the rule whose selector is exactly `selector`. */
const bgToken = (css, selector) => {
	const rule = css
		.split('}')
		.map((r) => r.split('{'))
		.find(([sel]) => sel?.trim() === selector)
	return rule?.[1]?.match(/\bbg-([a-z-]+)/)?.[1]
}

/** Tones that sit within a few hundredths of the page in either mode. */
const NEAR_PAGE = ['paper', 'paper-soft', 'paper-mute']

describe('zen-sumi switch — the off state is visible', () => {
	const css = read('zen-sumi/switch.css')
	const track = bgToken(css, "[data-style='zen-sumi'] [data-switch-track]")
	const thumb = bgToken(css, "[data-style='zen-sumi'] [data-switch] [data-switch-thumb]")

	it('paints the off track with a tone that stands off the page', () => {
		expect(track).toBeDefined()
		expect(NEAR_PAGE).not.toContain(track)
	})

	it('paints the off track in a different tone from the thumb', () => {
		expect(thumb).toBeDefined()
		expect(track).not.toBe(thumb)
	})

	it('uses the hairline tone, as the minimal theme does', () => {
		expect(track).toBe('paper-edge')
		expect(bgToken(read('minimal/switch.css'), "[data-style='minimal'] [data-switch-track]")).toBe(
			'paper-edge'
		)
	})

	it('keeps the on state: primary track, paper thumb', () => {
		const on = "[data-style='zen-sumi'] [data-switch][aria-checked='true']"
		expect(bgToken(css, `${on} [data-switch-track]`)).toBe('primary')
		expect(bgToken(css, `${on} [data-switch-thumb]`)).toBe('paper')
	})
})
