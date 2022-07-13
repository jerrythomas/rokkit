import { describe, expect, it, vi } from 'vitest'
import {
	toPascalCase,
	toHyphenCase,
	sortByParts,
	toInitCapCase,
	uniqueId,
	toHexString,
	compact
} from '../src/string'

describe('Utility Functions', () => {
	const hyphenVariations = [
		['small', 'Small'],
		['search-circle', 'SearchCircle'],
		['presentation-chart-bar', 'PresentationChartBar'],
		['ONE', 'One'],
		['ONE-TWO', 'OneTwo'],
		['ONE-TWO-THREE', 'OneTwoThree'],
		['One', 'One'],
		['One-Two', 'OneTwo'],
		['One-Two-Three', 'OneTwoThree']
	]
	const pascalCased = [
		['QrCode', 'qr-code'],
		['QuestionMarkCircle', 'question-mark-circle'],
		['Puzzle', 'puzzle'],
		['SaveAs', 'save-as']
	]

	it.each(hyphenVariations)('Should convert %s to %s', (input, expected) => {
		expect(toPascalCase(input)).toEqual(expected)
	})

	it.each(pascalCased)('Should convert %s to %s', (input, expected) => {
		expect(toHyphenCase(input)).toEqual(expected)
	})

	it('Should generate ordered list of names', () => {
		const values = [
			'arrows-expand',
			'arrow-up',
			'arrow-right',
			'arrow-narrow-up',
			'circle-down',
			'arrow-narrow-down',
			'arrow-narrow-right',
			'arrow-narrow-left',
			'arrow-left',
			'arrow-down',
			'arrow-circle-up',
			'arrow-circle-right',
			'arrow-circle-left',
			'arrow-circle-right',
			'arrow-circle-down'
		]
		expect(values.sort(sortByParts)).toEqual([
			'arrow-down',
			'arrow-left',
			'arrow-right',
			'arrow-up',
			'arrow-circle-down',
			'arrow-circle-left',
			'arrow-circle-right',
			'arrow-circle-right',
			'arrow-circle-up',
			'arrow-narrow-down',
			'arrow-narrow-left',
			'arrow-narrow-right',
			'arrow-narrow-up',
			'arrows-expand',
			'circle-down'
		])
	})

	it('should generate a unique id', () => {
		vi.useFakeTimers()
		let value = uniqueId()
		expect(uniqueId()).toEqual(value)
		vi.advanceTimersByTime(1)
		expect(uniqueId()).not.toEqual(value)

		value = uniqueId('xyz')
		expect(value.split('-')[0]).toEqual('xyz')
		expect(uniqueId('xyz')).toEqual(value)
		vi.advanceTimersByTime(1)
		expect(uniqueId('xyz')).not.toEqual(value)
		vi.useRealTimers()
	})

	it('should capitalize first letter', () => {
		expect(toInitCapCase('HELLO')).toEqual('Hello')
		expect(toInitCapCase('hello')).toEqual('Hello')
		expect(toInitCapCase('heLLo')).toEqual('Hello')
		expect(toInitCapCase('heLLo world')).toEqual('Hello world')
	})

	it('should remove undefined and null values', () => {
		let result = compact({ x: undefined, y: null, fill: 'something' })
		expect(result).toEqual({ fill: 'something' })
	})

	it('should convert to hex string', () => {
		expect(toHexString(15)).toEqual('0f')
		expect(toHexString(16, 0)).toEqual('10')
		expect(toHexString(31, 4)).toEqual('001f')
	})
})
