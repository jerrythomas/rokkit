import { describe, it, expect } from 'vitest'
import { generateTicks } from '../src/ticks'

describe('ticks', () => {
	it('should generate ticks using lower and upper bound', () => {
		const ticks = generateTicks(0, 4)
		expect(ticks).toEqual([
			{ value: 0, major: true },
			{ value: 4, major: true }
		])
	})
	it('should generate ticks using bounds and minor step', () => {
		const ticks = generateTicks(0, 4, 1)
		expect(ticks).toEqual([
			{ value: 0, major: true },
			{ value: 1, major: true },
			{ value: 2, major: true },
			{ value: 3, major: true },
			{ value: 4, major: true }
		])
	})
	it('should generate ticks using bounds, minor and major step', () => {
		const ticks = generateTicks(0, 4, 1, 2)
		expect(ticks).toEqual([
			{ value: 0, major: true },
			{ value: 1, major: false },
			{ value: 2, major: true },
			{ value: 3, major: false },
			{ value: 4, major: true }
		])
	})
})
