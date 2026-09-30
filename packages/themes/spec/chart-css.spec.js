import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const css = readFileSync(join(process.cwd(), 'packages/themes/src/base/chart.css'), 'utf-8').replace(
	/\/\*[\s\S]*?\*\//g,
	''
)

/** Declaration blocks whose selector list names `selector`, split into [selectors, body]. */
const rules = (selector) =>
	css
		.split('}')
		.map((r) => r.split('{'))
		.filter(([sel]) => sel?.includes(selector))

describe('chart hover — a point grows in place and shrinks back in place', () => {
	it('puts transform-box and transform-origin on the RESTING rule, not only on :hover', () => {
		// Only on :hover, they snap back to the SVG origin the instant the pointer leaves while
		// the scale is still easing 1.15 → 1 — so for ~120ms the point is scaled around the
		// chart's top-left corner. Measured: a point 87px from where it sits, sliding back.
		const resting = rules("circle[data-plot-element='point']").filter(([sel]) => !sel.includes(':hover'))
		const body = resting.map(([, b]) => b).join(';')
		expect(body).toMatch(/transform-box:\s*fill-box/)
		expect(body).toMatch(/transform-origin:\s*center/)
	})

	it('still scales on hover', () => {
		const hover = rules("circle[data-plot-element='point']:hover").map(([, b]) => b).join(';')
		expect(hover).toMatch(/transform:\s*scale\(/)
	})
})
