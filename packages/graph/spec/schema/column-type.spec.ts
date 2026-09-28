import { describe, it, expect } from 'vitest'
import { baseType, typeSize } from '../../src/schema/column-type.js'

describe('baseType', () => {
	it('returns a plain type unchanged', () => {
		expect(baseType('uuid')).toBe('uuid')
	})

	it('strips a size argument', () => {
		expect(baseType('varchar(255)')).toBe('varchar')
	})

	it('strips a precision pair', () => {
		expect(baseType('numeric(10,2)')).toBe('numeric')
	})

	it('strips an array suffix', () => {
		expect(baseType('text[]')).toBe('text')
	})

	it('strips both an argument and an array suffix', () => {
		expect(baseType('varchar(80)[]')).toBe('varchar')
	})

	it('tolerates an empty type', () => {
		expect(baseType('')).toBe('')
	})
})

describe('typeSize', () => {
	it('extracts a size argument', () => {
		expect(typeSize('varchar(255)')).toBe('255')
	})

	it('extracts a precision pair verbatim', () => {
		expect(typeSize('numeric(10,2)')).toBe('10,2')
	})

	it('reports an array as []', () => {
		expect(typeSize('text[]')).toBe('[]')
	})

	it('prefers the argument over the array marker when both are present', () => {
		expect(typeSize('varchar(80)[]')).toBe('80')
	})

	it('shows an em dash when a type carries no size', () => {
		expect(typeSize('uuid')).toBe('—')
	})

	it('tolerates an empty type', () => {
		expect(typeSize('')).toBe('—')
	})
})
