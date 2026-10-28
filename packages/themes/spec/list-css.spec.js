/* A zen-sumi List at rest reads a step quieter in dark mode: ink (sumi 900, L 0.94) on sumi 50
 * glared as a rail of near-white labels (sensei, 2026-10-28). Resting items take ink-mute by
 * night; hover, focus and the current item keep their own colours. */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const css = readFileSync(join(process.cwd(), 'packages/themes/src/zen-sumi/list.css'), 'utf-8').replace(
	/\/\*[\s\S]*?\*\//g,
	''
)
const rules = css
	.split('}')
	.map((r) => r.split('{'))
	.filter(([sel, body]) => sel && body)
	.map(([sel, body], index) => ({ sel: sel.replace(/\s+/g, ' ').trim(), body, index }))

describe('zen-sumi list — dark mode resting items', () => {
	const dark = rules.find(
		(r) => r.sel.includes("[data-mode='dark']") && /\[data-list-item\]$/.test(r.sel)
	)

	it('quiets resting item text to ink-mute', () => {
		expect(dark?.body).toMatch(/\btext-ink-mute\b/)
	})

	it('applies whether data-mode sits on the styled element or above it', () => {
		expect(dark?.sel).toContain("[data-mode='dark'] [data-style='zen-sumi']")
		expect(dark?.sel).toContain("[data-style='zen-sumi'][data-mode='dark']")
	})

	it('comes before the hover and current-item rules, so they still win', () => {
		const hover = rules.find((r) => r.sel.includes('[data-list-item]:hover'))
		const active = rules.find((r) => r.sel.includes("[data-list-item][data-active='true']"))
		expect(dark.index).toBeLessThan(hover.index)
		expect(dark.index).toBeLessThan(active.index)
	})
})
