import { describe, it, expect } from 'vitest'
import { scalePos } from '../../src/lib/scale.js'

describe('scalePos', () => {
	it('maps through a plain (non-band) scale', () => {
		const s = (v) => v * 10
		expect(scalePos(s, 3)).toBe(30)
	})
	it('centers on a band scale (adds bandwidth/2)', () => {
		const s = (v) => (v === 'a' ? 0 : 20)
		s.bandwidth = () => 10
		expect(scalePos(s, 'a')).toBe(5)
		expect(scalePos(s, 'b')).toBe(25)
	})
	it('returns NaN when the scale yields undefined (out of domain)', () => {
		const s = () => undefined
		s.bandwidth = () => 10
		expect(Number.isNaN(scalePos(s, 'x'))).toBe(true)
	})
})
