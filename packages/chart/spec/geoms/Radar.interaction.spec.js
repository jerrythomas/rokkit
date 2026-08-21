import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import TestRadar from '../helpers/TestRadar.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'

/**
 * Radar's vertex hit targets. Mirrors `Bar.interaction.spec.js` in shape.
 *
 * Two of these tests exist specifically to prove the row-identity work in
 * `verticesFor` (plan task 5) actually reaches the caller: duplicate `(series, axis)`
 * cells are averaged inside `polar.js` rather than via a `stat`, precisely so the
 * surviving `row` is still one of the container's original row objects. If that broke,
 * `plotState.data.indexOf(row)` would return `-1` and any non-channel field on the row
 * would vanish from the emitted detail. Asserting only "onselect fired" would not
 * notice either failure.
 */

const AXES = ['metric1', 'metric2', 'metric3']

// `note` is deliberately not bound to any channel — it is the field whose survival
// proves the detail carries the ORIGINAL row rather than a rebuilt one.
const rows = [
	{ axis: 'metric1', value: 10, series: 'S1', note: 'first' },
	{ axis: 'metric2', value: 20, series: 'S1', note: 'second' },
	{ axis: 'metric3', value: 15, series: 'S1', note: 'third' }
]

function radarState(overrides = {}) {
	return createMockState({
		innerWidth: 300,
		innerHeight: 300,
		colors: new Map([['S1', { fill: 'lightblue', stroke: 'darkblue' }]]),
		patterns: new Map(),
		geomData: () => rows,
		// The container's own row list — what `indexOf` is resolved against.
		data: rows,
		setHovered: () => {},
		clearHovered: () => {},
		...overrides
	})
}

const channelProps = { axis: 'axis', value: 'value', series: 'series', axes: AXES }

const vertexAt = (container, axisKey) =>
	container.querySelector(
		`[data-plot-element="radar-vertex"][data-plot-series="S1"][data-plot-axis="${axisKey}"]`
	)

describe('Radar — vertex focusability', () => {
	it('exposes vertices as buttons when the plot is interactive', () => {
		const { container } = render(TestRadar, {
			state: radarState({ interactive: true, handleSelect: () => {} }),
			...channelProps
		})
		const vertex = vertexAt(container, 'metric1')
		expect(vertex.getAttribute('tabindex')).toBe('0')
		expect(vertex.getAttribute('role')).toBe('button')
	})

	it('leaves vertices unfocusable when the plot is not interactive and no onselect is given', () => {
		const { container } = render(TestRadar, { state: radarState(), ...channelProps })
		const vertex = vertexAt(container, 'metric1')
		expect(vertex.getAttribute('tabindex')).toBeNull()
		expect(vertex.getAttribute('role')).not.toBe('button')
	})

	it('exposes vertices as buttons for a geom-level onselect even when the plot is inert', () => {
		const { container } = render(TestRadar, {
			state: radarState(),
			onselect: () => {},
			...channelProps
		})
		expect(vertexAt(container, 'metric1').getAttribute('tabindex')).toBe('0')
	})
})

describe('Radar — vertex activation', () => {
	it.each(['Enter', ' '])('%s selects the vertex, passing its original row', async (key) => {
		const onselect = vi.fn()
		const { container } = render(TestRadar, { state: radarState(), onselect, ...channelProps })

		await fireEvent.keyDown(vertexAt(container, 'metric2'), { key })

		// Identity, not equality: the row handed out must BE the input row object.
		expect(onselect).toHaveBeenCalledTimes(1)
		expect(onselect.mock.calls[0][0]).toBe(rows[1])
	})

	it('ignores keys other than Enter and Space', async () => {
		const onselect = vi.fn()
		const { container } = render(TestRadar, { state: radarState(), onselect, ...channelProps })
		await fireEvent.keyDown(vertexAt(container, 'metric1'), { key: 'ArrowRight' })
		expect(onselect).not.toHaveBeenCalled()
	})

	it('selects on click', async () => {
		const onselect = vi.fn()
		const { container } = render(TestRadar, { state: radarState(), onselect, ...channelProps })
		await fireEvent.click(vertexAt(container, 'metric3'))
		expect(onselect).toHaveBeenCalledWith(rows[2])
	})
})

describe('Radar — plot-level selection detail', () => {
	it('routes a resolvable index and the untouched row into handleSelect', async () => {
		const handleSelect = vi.fn()
		const { container } = render(TestRadar, {
			state: radarState({ interactive: true, handleSelect }),
			...channelProps
		})

		await fireEvent.click(vertexAt(container, 'metric2'))

		expect(handleSelect).toHaveBeenCalledTimes(1)
		const detail = handleSelect.mock.calls[0][0]

		// The whole point of averaging inside polar.js instead of via a stat: the row is
		// still findable in the container's data.
		expect(detail.index).not.toBe(-1)
		expect(detail.index).toBe(1)
		// ...and a field bound to no channel survives into the payload.
		expect(detail.datum.note).toBe('second')
		expect(detail.datum).toBe(rows[1])
	})

	it('reports the standard detail shape for a radar vertex', async () => {
		const handleSelect = vi.fn()
		const { container } = render(TestRadar, {
			state: radarState({ interactive: true, handleSelect }),
			...channelProps
		})

		await fireEvent.click(vertexAt(container, 'metric1'))
		const detail = handleSelect.mock.calls[0][0]

		expect(detail.geom).toBe('radar')
		expect(detail.series).toBe('S1')
		expect(detail.x).toBe('metric1')
		expect(detail.y).toBe(10)
		expect(detail.value).toBe(10)
		expect(detail.event).toBeTruthy()
	})

	it('does not route to handleSelect when the plot is not interactive', async () => {
		const handleSelect = vi.fn()
		const onselect = vi.fn()
		const { container } = render(TestRadar, {
			state: radarState({ interactive: false, handleSelect }),
			onselect,
			...channelProps
		})

		await fireEvent.click(vertexAt(container, 'metric1'))

		// The geom's own callback still fires — only the plot-level selection is withheld.
		expect(onselect).toHaveBeenCalledTimes(1)
		expect(handleSelect).not.toHaveBeenCalled()
	})
})

describe('Radar — hover', () => {
	it('reports the hovered row to the plot, and clears it on leave', async () => {
		const setHovered = vi.fn()
		const clearHovered = vi.fn()
		const { container } = render(TestRadar, {
			state: radarState({ setHovered, clearHovered }),
			...channelProps
		})

		const vertex = vertexAt(container, 'metric3')
		await fireEvent.mouseEnter(vertex)
		expect(setHovered).toHaveBeenCalledWith(rows[2])

		await fireEvent.mouseLeave(vertex)
		expect(clearHovered).toHaveBeenCalled()
	})
})
