import { describe, it, expect } from 'vitest'
import * as constants from '../../src/layout/constants.js'

// These are carried over from dbd's layout-types.ts unchanged, because the ported
// characterization specs (clusters, edges) pin exact pixel output. Changing any one of
// them is a visible behaviour change, not a tuning detail.
//
// Pinning them here means an accidental edit fails with "CARD_W moved" rather than
// surfacing three tasks later as an unexplained pixel diff in a ported spec.
const FROM_DBD = {
	CARD_W: 248,
	ROW_H: 24,
	HEAD_H: 40,
	MORE_H: 22,
	PAD_B: 6,
	GAP_X: 36,
	GAP_Y: 30,
	CL_PAD: 26,
	CL_TITLE: 16,
	CL_GAP_X: 110,
	CL_GAP_Y: 110,
	MAX_ROW_W: 2750
}

describe('layout geometry constants', () => {
	it('matches dbd layout-types.ts exactly', () => {
		// Object.entries rather than the namespace object itself: a module namespace also
		// carries Symbol.toStringTag, which toEqual reports as a difference with no visible diff.
		expect(Object.fromEntries(Object.entries(constants))).toEqual(FROM_DBD)
	})

	it('drops HUES — colour comes from CSS and the preset, not the layout', () => {
		// dbd baked eight oklch hue angles into the layout module and assigned them a-z.
		// Under this design a cluster carries `groupIndex` and the paint is resolved by
		// resolveGroupStyles or a CSS rule, so a hue table in the geometry layer would be a
		// second, competing source of colour.
		expect('HUES' in constants).toBe(false)
	})
})
