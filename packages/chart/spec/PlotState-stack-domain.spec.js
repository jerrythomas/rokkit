/**
 * The stacked-bar value domain must follow the SAME stacking rule the bar builder draws with.
 * It had its own copy, and the two disagreed — so the axis could end below the tallest bar.
 */
import { describe, it, expect } from 'vitest'
import { PlotState } from '../src/PlotState.svelte.js'

const top = (state) => state.yScale.domain()[1]

describe('stacked bar domain follows the builder’s stacking rule', () => {
	it('fill on the x field is not a stack — the builder draws plain bars, so the axis spans them', () => {
		// Builder: no stacking field (fill === x) → plain bars at 10 and 2. The old domain stacked
		// by x anyway, kept the LAST row per column (2), and cut the 10 bar off.
		const data = [
			{ q: 'Q1', v: 10 },
			{ q: 'Q1', v: 2 }
		]
		const state = new PlotState({ data, channels: { x: 'q', y: 'v' } })
		state.registerGeom({ type: 'bar', channels: { fill: 'q' }, options: { position: 'stack' } })
		expect(top(state)).toBeGreaterThanOrEqual(10)
	})

	it('a bar stacked by its own group channel reaches the group total', () => {
		// Builder stacks by `group` (p): Q1 = 3 + 4 = 7. The old domain never saw `group`.
		const data = [
			{ q: 'Q1', p: 'A', c: 'x', v: 3 },
			{ q: 'Q1', p: 'B', c: 'x', v: 4 }
		]
		const state = new PlotState({ data, channels: { x: 'q', y: 'v' } })
		state.registerGeom({
			type: 'bar',
			channels: { group: 'p', fill: 'c' },
			options: { position: 'stack' }
		})
		expect(top(state)).toBeGreaterThanOrEqual(7)
	})
})
