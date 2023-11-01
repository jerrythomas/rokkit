import { describe, it, expect } from 'vitest'
import { getCalendarDays } from '../src/calendar'

describe('calendar', () => {
	describe('getCalendarDays', () => {
		it('returns an array of calendar days with correct properties', () => {
			const value = new Date('2023-Jun-01')

			const result = getCalendarDays(value)

			expect(Array.isArray(result)).toBeTruthy()
			expect(result).toHaveLength(30)

			// Check properties for each day
			for (let i = 0; i < result.length; i++) {
				const day = result[i]

				// expect(day).toBeObject()
				expect(day).toHaveProperty('day')
				expect(day).toHaveProperty('offset')
				expect(day).toHaveProperty('date')
				expect(day).toHaveProperty('weekend')
				expect(day).toHaveProperty('holiday')

				expect(typeof day.day).toEqual('number')
				expect(typeof day.offset).toEqual('number')
				expect(typeof day.date).toEqual('object')
				expect(typeof day.weekend).toEqual('boolean')
				expect(typeof day.holiday).toEqual('boolean')
				expect(result.map(({ day }) => day)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1))
				expect(result[0].offset).toEqual(5)
				expect(result.slice(1).filter((x) => x.offset != 0)).toEqual([])
			}
		})

		it('correctly calculates days when fixed option is true', () => {
			const value = new Date('2023-Jul-01')
			const holidays = []
			const fixed = true

			const result = getCalendarDays(value, holidays, fixed)

			expect(Array.isArray(result)).toBeTruthy()
			expect(result).toHaveLength(31)
			expect(result[0].offset).toEqual(0)
			expect(result.filter((x) => x.offset != 0)).toEqual([
				{
					date: new Date('2023-Jul-01'),
					day: 1,
					holiday: false,
					offset: 7,
					text: '2023-Jul-01',
					weekend: true
				}
			])
			expect(result.map(({ day }) => day)).toEqual([
				30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
				24, 25, 26, 27, 28, 29
			])
		})

		it('correctly calculates days when holidays are included', () => {
			const value = new Date('2023-Jul-02')
			const holidays = ['2023-Jul-04']
			const fixed = true

			const result = getCalendarDays(value, holidays, fixed)

			expect(Array.isArray(result)).toBeTruthy()
			expect(result).toHaveLength(31)
			expect(result[0].offset).toEqual(0)
			expect(result.filter((x) => x.offset != 0)).toEqual([
				{
					date: new Date('2023-Jul-01'),
					day: 1,
					holiday: false,
					offset: 7,
					text: '2023-Jul-01',
					weekend: true
				}
			])
			expect(result.map(({ day }) => day)).toEqual([
				30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
				24, 25, 26, 27, 28, 29
			])
			expect(result.filter((x) => x.holiday)).toEqual([
				{
					day: 4,
					offset: 0,
					date: new Date('2023-Jul-04'),
					weekend: false,
					text: '2023-Jul-04',
					holiday: true
				}
			])
		})
	})
})
