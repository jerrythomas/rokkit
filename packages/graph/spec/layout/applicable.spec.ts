/* Which options each layout actually READS.
 *
 * A control for an option the active layout ignores is worse than a missing one: it looks like
 * a knob, it moves, and nothing happens — the reader concludes the view is broken rather than
 * that the control does not apply. `names | keys | full` over a treemap is the clearest case,
 * since a treemap box has no row list to thin out.
 *
 * Exported rather than kept in the demo because it is a fact about the LAYOUT, and a consumer
 * building its own controls needs the same answer. A hand-maintained copy drifts the first time
 * a layout gains an option.
 */

import { describe, it, expect } from 'vitest'
import {
	LAYOUT_OPTIONS,
	LAYOUT_OPTION_KEYS,
	appliesTo,
	nodeShapeOf
} from '../../src/layout/options.js'
import { layouts } from '../../src/layout/index.js'

describe('per-layout option applicability', () => {
	it('covers every registered layout', () => {
		expect(Object.keys(LAYOUT_OPTIONS).sort()).toEqual(Object.keys(layouts).sort())
	})

	it('names only options that LayoutOptions actually defines', () => {
		for (const [name, keys] of Object.entries(LAYOUT_OPTIONS)) {
			for (const key of keys) {
				expect(LAYOUT_OPTION_KEYS, `${name}.${key}`).toContain(key)
			}
		}
	})

	it('calls a node a dot where the layout draws one, and a card otherwise', () => {
		// The theme keys its whole dot treatment on this rather than naming each layout that
		// happens to have one: a card's head, kind tag and more-row are all still in the DOM
		// at 20px across, overflowing a box the layout sized for a dot.
		expect(nodeShapeOf('points')).toBe('dot')
		expect(nodeShapeOf('radial')).toBe('dot')
		expect(nodeShapeOf('cluster')).toBe('card')
		expect(nodeShapeOf('flow')).toBe('card')
	})

	it('assumes a card for an unknown layout, which is the safe default', () => {
		// A custom LayoutFn gets full card chrome rather than a head-only box with its rows
		// invisible — wrong in the recoverable direction.
		expect(nodeShapeOf('something-custom')).toBe('card')
	})

	it('answers per layout, which is what a control panel asks', () => {
		expect(appliesTo('cluster', 'density')).toBe(true)
		expect(appliesTo('world', 'density')).toBe(false)
	})

	it('assumes an unknown layout supports an option, rather than hiding controls', () => {
		// A custom LayoutFn the package knows nothing about gets the full panel. Wrong in the
		// recoverable direction: a control too many is visible, where a control too few is not.
		expect(appliesTo('something-custom', 'density')).toBe(true)
	})

	it('excludes density from the treemap, which has no row lists to thin', () => {
		expect(LAYOUT_OPTIONS.world).not.toContain('density')
	})

	it('excludes edgeStyle from the treemap, which draws no edges', () => {
		// Containment IS the relationship in a world view; the layout returns no routed edges
		// at all, so a curved/orthogonal toggle is a control over nothing.
		expect(LAYOUT_OPTIONS.world).not.toContain('edgeStyle')
	})

	it('excludes the drill options from every layout but the treemap', () => {
		for (const name of ['cluster', 'neighborhood', 'points']) {
			expect(LAYOUT_OPTIONS[name], name).not.toContain('focusPath')
			expect(LAYOUT_OPTIONS[name], name).not.toContain('levels')
		}
	})

	it('keeps focus and depth on neighborhood alone', () => {
		expect(LAYOUT_OPTIONS.neighborhood).toContain('focus')
		expect(LAYOUT_OPTIONS.neighborhood).toContain('depth')
		expect(LAYOUT_OPTIONS.cluster).not.toContain('depth')
	})

	it('gives the size channel to the layouts whose geometry encodes a measure', () => {
		expect(LAYOUT_OPTIONS.points).toContain('sizeBy')
		expect(LAYOUT_OPTIONS.world).toContain('sizeBy')
		// A cluster card is sized by its rows, so a measure has nothing to drive.
		expect(LAYOUT_OPTIONS.cluster).not.toContain('sizeBy')
	})
})
