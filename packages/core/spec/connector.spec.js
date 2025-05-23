import { describe, expect, it } from 'vitest'
import { getLineTypes } from '../src/connector.js'

describe('connector', () => {
	it('should add empty space for leaf nodes', () => {
		let result = getLineTypes(false)
		expect(result).toEqual(['empty'])
		result = getLineTypes(true)
		expect(result).toEqual(['icon'])
	})

	it('should add line for next level', () => {
		let result = getLineTypes(false, ['icon'], 'child')
		expect(result).toEqual(['child', 'empty'])
		result = getLineTypes(false, ['icon'], 'last')
		expect(result).toEqual(['last', 'empty'])
	})

	it('should add empty line for deeper levels', () => {
		let result = getLineTypes(true, ['icon'], 'child')
		expect(result).toEqual(['child', 'icon'])
		result = getLineTypes(false, ['child', 'icon'], 'child')
		expect(result).toEqual(['sibling', 'child', 'empty'])
		result = getLineTypes(false, ['child', 'icon'], 'last')
		expect(result).toEqual(['sibling', 'last', 'empty'])
		result = getLineTypes(false, ['child', 'last', 'icon'], 'last')
		expect(result).toEqual(['sibling', 'empty', 'last', 'empty'])
		result = getLineTypes(false, ['child', 'empty', 'icon'], 'last')
		expect(result).toEqual(['sibling', 'empty', 'last', 'empty'])
	})
})
