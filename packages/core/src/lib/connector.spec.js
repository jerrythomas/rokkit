import { describe, expect, it } from 'vitest'
import { getLineTypes } from './connector.js'

describe('connector', () => {
	const fields = { children: 'children' }

	it('should add empty space for leaf nodes', () => {
		let result = getLineTypes(false)
		expect(result).toEqual(['empty'])
		result = getLineTypes(true)
		expect(result).toEqual(['icon'])
	})

	it('should add line for next level', () => {
		let result = getLineTypes(false, ['icon'], 'middle')
		expect(result).toEqual(['middle', 'empty'])
		result = getLineTypes(false, ['icon'], 'last')
		expect(result).toEqual(['last', 'empty'])
	})

	it('should add empty line for deeper levels', () => {
		let result = getLineTypes(true, ['icon'], 'middle')
		expect(result).toEqual(['middle', 'icon'])
		result = getLineTypes(false, ['middle', 'icon'], 'middle')
		expect(result).toEqual(['line', 'middle', 'empty'])
		result = getLineTypes(false, ['middle', 'icon'], 'last')
		expect(result).toEqual(['line', 'last', 'empty'])
	})
})
