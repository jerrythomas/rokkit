/* The wedge-to-path arithmetic. Pure, so tested to exact coordinates. */

import { describe, it, expect } from 'vitest'
import { arcPath } from '../../src/layout/arc.js'

const TAU = Math.PI * 2

describe('arcPath', () => {
	it('starts an outer arc at the wedge’s own start angle', () => {
		// a0 = 0 is 3 o'clock, so the first point is directly right of the centre.
		const d = arcPath(100, 100, { r0: 10, r1: 20, a0: 0, a1: Math.PI / 2 })

		expect(d.startsWith('M 120 100 ')).toBe(true)
	})

	it('closes a wedge that starts at the centre through the centre', () => {
		// r0 = 0 has no inner arc to draw: the two inner corners are the same point.
		const d = arcPath(100, 100, { r0: 0, r1: 20, a0: 0, a1: Math.PI / 2 })

		expect(d).toContain('L 100 100 Z')
		expect(d).not.toContain('A 0 0')
	})

	it('draws an inner arc when the wedge is a ring segment', () => {
		const d = arcPath(0, 0, { r0: 10, r1: 20, a0: 0, a1: Math.PI / 2 })

		// Outer sweeps one way, inner the other, so the outline closes without crossing.
		expect(d).toContain('A 20 20 0 0 1')
		expect(d).toContain('A 10 10 0 0 0')
	})

	it('sets the large-arc flag past a half turn', () => {
		const small = arcPath(0, 0, { r0: 0, r1: 20, a0: 0, a1: Math.PI / 2 })
		const big = arcPath(0, 0, { r0: 0, r1: 20, a0: 0, a1: Math.PI * 1.5 })

		expect(small).toContain('A 20 20 0 0 1')
		expect(big).toContain('A 20 20 0 1 1')
	})

	it('draws a FULL turn as two arcs, because one cannot', () => {
		// SVG's A command draws between two points; for a complete circle they coincide and the
		// command is a no-op, so the wedge silently vanishes. One child filling its parent's
		// whole span is the common case at the root, not an edge case.
		const d = arcPath(0, 0, { r0: 0, r1: 20, a0: 0, a1: TAU })

		expect(d.match(/A /g)?.length).toBe(2)
	})

	it('punches the hole out of a full ring', () => {
		const d = arcPath(0, 0, { r0: 10, r1: 20, a0: 0, a1: TAU })

		expect(d.match(/A /g)?.length).toBe(4)
		expect(d).toContain('A 10 10')
	})

	it('offsets by the centre it is given', () => {
		const origin = arcPath(0, 0, { r0: 0, r1: 20, a0: 0, a1: Math.PI / 2 })
		const moved = arcPath(50, 50, { r0: 0, r1: 20, a0: 0, a1: Math.PI / 2 })

		expect(origin).not.toBe(moved)
		expect(moved.startsWith('M 70 50')).toBe(true)
	})

	it('is deterministic', () => {
		const w = { r0: 10, r1: 20, a0: 0.3, a1: 1.2 }

		expect(arcPath(5, 5, w)).toBe(arcPath(5, 5, w))
	})
})
