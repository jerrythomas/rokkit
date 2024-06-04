import { expect, describe, it } from 'vitest'
import { getTicks, ticksByType } from '../../src/lib/ticks'

describe('ticks', () => {
	describe('ticksByType', () => {
		it('should generate an array of ticks for a given axis and the tick type', () => {
			const ticks = ticksByType(0, 100, 10, 'major')
			expect(ticks).toEqual([
				{ position: 10, label: 10, type: 'major' },
				{ position: 20, label: 20, type: 'major' },
				{ position: 30, label: 30, type: 'major' },
				{ position: 40, label: 40, type: 'major' },
				{ position: 50, label: 50, type: 'major' },
				{ position: 60, label: 60, type: 'major' },
				{ position: 70, label: 70, type: 'major' },
				{ position: 80, label: 80, type: 'major' },
				{ position: 90, label: 90, type: 'major' }
			])
		})
	})
	describe('getTicks', () => {
		it('should generate default ticks for axis', () => {
			const ticks = getTicks(0, 100)
			expect(ticks).toEqual([
				{ position: 0, label: 0, type: 'end' },
				{ position: 10, label: 10, type: 'major' },
				{ position: 20, label: 20, type: 'major' },
				{ position: 30, label: 30, type: 'major' },
				{ position: 40, label: 40, type: 'major' },
				{ position: 50, label: 50, type: 'major' },
				{ position: 60, label: 60, type: 'major' },
				{ position: 70, label: 70, type: 'major' },
				{ position: 80, label: 80, type: 'major' },
				{ position: 90, label: 90, type: 'major' },
				{ position: 100, label: 100, type: 'end' }
			])
		})
		it('should generate minor ticks for axis', () => {
			const ticks = getTicks(0, 100, { major: 0, minor: 10 })
			expect(ticks).toEqual([
				{ position: 0, label: 0, type: 'end' },
				{ position: 10, label: 10, type: 'minor' },
				{ position: 20, label: 20, type: 'minor' },
				{ position: 30, label: 30, type: 'minor' },
				{ position: 40, label: 40, type: 'minor' },
				{ position: 50, label: 50, type: 'minor' },
				{ position: 60, label: 60, type: 'minor' },
				{ position: 70, label: 70, type: 'minor' },
				{ position: 80, label: 80, type: 'minor' },
				{ position: 90, label: 90, type: 'minor' },
				{ position: 100, label: 100, type: 'end' }
			])
		})
		it('should generate major ticks for axis', () => {
			const ticks = getTicks(0, 100, { major: 10, minor: 0 })
			expect(ticks).toEqual([
				{ position: 0, label: 0, type: 'end' },
				{ position: 10, label: 10, type: 'major' },
				{ position: 20, label: 20, type: 'major' },
				{ position: 30, label: 30, type: 'major' },
				{ position: 40, label: 40, type: 'major' },
				{ position: 50, label: 50, type: 'major' },
				{ position: 60, label: 60, type: 'major' },
				{ position: 70, label: 70, type: 'major' },
				{ position: 80, label: 80, type: 'major' },
				{ position: 90, label: 90, type: 'major' },
				{ position: 100, label: 100, type: 'end' }
			])
		})
		it('should generate major & minor ticks for axis', () => {
			const ticks = getTicks(0, 50, { major: 10, minor: 5 })
			expect(ticks).toEqual([
				{ position: 0, label: 0, type: 'end' },
				{ position: 5, label: 5, type: 'minor' },
				{ position: 10, label: 10, type: 'major' },
				{ position: 15, label: 15, type: 'minor' },
				{ position: 20, label: 20, type: 'major' },
				{ position: 25, label: 25, type: 'minor' },
				{ position: 30, label: 30, type: 'major' },
				{ position: 35, label: 35, type: 'minor' },
				{ position: 40, label: 40, type: 'major' },
				{ position: 45, label: 45, type: 'minor' },
				{ position: 50, label: 50, type: 'end' }
			])
		})
	})
})
