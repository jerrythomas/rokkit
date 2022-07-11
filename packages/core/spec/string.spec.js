import { describe, expect, it } from 'vitest'
import { toPascalCase, toHyphenCase, sortByParts } from '../src/string'
// import { names } from './names.js'

describe('Icon.svelte', () => {
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

	// it.each(names)('Should convert "%s" to hyphenCase and back', (name) => {
	// 	const hyphenated = toHyphenCase(name)
	// 	expect(toPascalCase(hyphenated)).toEqual(name)
	// })

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
})
