import { describe, it, expect } from 'vitest'
import { SparkState, GEOM_CONTRACT } from '../src/SparkState.svelte.js'
import { PlotState } from '../src/PlotState.svelte.js'

/**
 * Pins `SparkState` to the geom-facing subset of `PlotState`'s surface.
 *
 * Both classes publish on the SAME `'plot-state'` context key, and a geom never
 * knows (or branches on) which one it resolved — so if `PlotState` grows a member a
 * geom reads and `SparkState` doesn't gain it too, a `<Spark>` breaks at runtime
 * inside a consumer's table cell, far from whatever change caused it. This test turns
 * that into an immediate, local CI failure instead.
 *
 * `GEOM_CONTRACT` (exported by `SparkState.svelte.js`, documented there) is the single
 * source of truth for what "the geom-facing surface" means. This file only asserts
 * against it — the contract itself is not redefined here, so there is exactly one
 * place to update when a geom legitimately grows a new context dependency.
 */

const config = { data: [{ x: 0, y: 1 }], channels: { x: 'x', y: 'y' } }
const spark = new SparkState(config)
const plot = new PlotState(config)

// `in` (not `!== undefined`) so a member whose real value happens to be `undefined`
// still counts as "provided" — only a genuinely absent property fails this.
const has = (obj, key) => key in obj

/**
 * Classifies a member's runtime kind more precisely than `typeof`: `typeof` alone
 * can't tell a Map from a plain object, or an array from either — all three report
 * 'object'. A geom that calls `.get()` on what it expects to be a Map, or indexes
 * into what it expects to be an array, breaks just as badly as calling a non-function,
 * so those distinctions matter here too.
 */
function kindOf(value) {
	if (typeof value === 'function') return 'function'
	if (value === null) return 'null'
	if (Array.isArray(value)) return 'array'
	if (value instanceof Map) return 'map'
	return typeof value
}

// The exact, sorted contract this test expects — independent of GEOM_CONTRACT's
// current contents, so a future edit that empties or truncates the array (leaving
// `it.each` below to silently generate zero cases) still fails loudly right here.
const EXPECTED_CONTRACT = [
	'channels',
	'chartPreset',
	'clearHovered',
	'colors',
	'continuousCategory',
	'continuousColorScale',
	'data',
	'geomData',
	'handleSelect',
	'innerHeight',
	'innerWidth',
	'interactive',
	'isFlipped',
	'orientation',
	'patterns',
	'place',
	'registerGeom',
	'setHovered',
	'symbols',
	'unregisterGeom',
	'updateGeom',
	'xScale',
	'yScale'
]

describe('SparkState conformance — GEOM_CONTRACT', () => {
	it('is exactly the expected, non-trivial member list (guards against an emptied or truncated contract)', () => {
		expect(GEOM_CONTRACT.length).toBe(EXPECTED_CONTRACT.length)
		expect([...GEOM_CONTRACT].sort()).toEqual(EXPECTED_CONTRACT)
	})

	it.each(GEOM_CONTRACT)('SparkState provides %s', (key) => {
		expect(has(spark, key)).toBe(true)
	})

	it.each(GEOM_CONTRACT)(
		'PlotState also provides %s (proves the contract is accurate, not invented)',
		(key) => {
			expect(has(plot, key)).toBe(true)
		}
	)

	it.each(GEOM_CONTRACT)('%s is the same kind on SparkState and PlotState', (key) => {
		expect(kindOf(spark[key])).toBe(kindOf(plot[key]))
	})
})
