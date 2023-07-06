import { describe, expect, it } from 'vitest'
import {
	verifiable,
	getPatternValidator,
	getRangeValidator,
	getTypeValidator
} from '../src/validator'
import { get } from 'svelte/store'

describe('validator', () => {
	describe('getPatternValidator', () => {
		it('should return a pattern validator function for a string pattern', () => {
			const pattern = '^example$'
			const validator = getPatternValidator(pattern)

			expect(validator).toBeDefined()
			expect(typeof validator).toBe('function')

			expect(validator('example')).toBe(true)
			expect(validator('wrong')).toBe(false)
		})

		it('should return a pattern validator function for a RegExp pattern', () => {
			const pattern = /^example$/
			const validator = getPatternValidator(pattern)

			expect(validator).toBeDefined()
			expect(typeof validator).toBe('function')

			expect(validator('example')).toBe(true)
			expect(validator('wrong')).toBe(false)
		})

		it('should throw an error for an invalid pattern', () => {
			const pattern = 123

			expect(() => {
				getPatternValidator(pattern)
			}).toThrowError('Invalid pattern')
		})
	})

	describe('getRangeValidator', () => {
		it('should return a range validator function', () => {
			const min = 5
			const max = 10
			const validator = getRangeValidator(min, max)

			expect(validator).toBeDefined()
			expect(typeof validator).toBe('function')

			expect(validator(3)).toBe(false)
			expect(validator(7)).toBe(true)
			expect(validator(12)).toBe(false)
		})

		it('should return a range validator for upper bound', () => {
			const validator = getRangeValidator(null, 10)

			expect(validator).toBeDefined()
			expect(typeof validator).toBe('function')

			expect(validator(7)).toBe(true)
			expect(validator(12)).toBe(false)
		})
		it('should return a range validator for lower bound', () => {
			const validator = getRangeValidator(5, null)

			expect(validator).toBeDefined()
			expect(typeof validator).toBe('function')

			expect(validator(3)).toBe(false)
			expect(validator(12)).toBe(true)
		})
	})

	describe('getTypeValidator', () => {
		it('should return a validator for "number" type', () => {
			const validator = getTypeValidator('number')
			expect(validator).toBeInstanceOf(Function)
			expect(validator(42)).toBe(true)
			expect(validator('hello')).toBe(false)
			expect(validator(null)).toBe(false)
			expect(validator(undefined)).toBe(false)
		})

		it('should return a validator for "email" type', () => {
			const validator = getTypeValidator('email')
			expect(validator).toBeInstanceOf(Function)
			expect(validator('test@example.com')).toBe(true)
			expect(validator('a@b.co.in')).toBe(true)
			expect(validator('invalid-email')).toBe(false)
		})

		it('should return a validator for "url" type', () => {
			const validator = getTypeValidator('url')
			expect(validator).toBeInstanceOf(Function)
			expect(validator('https://example.com')).toBe(true)
			expect(validator('http://example.com')).toBe(true)
			expect(validator('http://example.com?a=b')).toBe(true)
			expect(validator('http://example.com?a=1&c=1')).toBe(true)
			expect(validator('http://example.com?#123')).toBe(true)
			expect(validator('invalid-url')).toBe(false)
			expect(validator('http://x.y abc')).toBe(false)
		})

		it('should return a validator for "array" type', () => {
			const validator = getTypeValidator('array')
			expect(validator).toBeInstanceOf(Function)
			expect(validator([])).toBe(true)
			expect(validator(null)).toBe(false)
			expect(validator(undefined)).toBe(false)
			expect(validator({})).toBe(false)
			expect(validator('hello')).toBe(false)
		})
		it('should return a validator for "object" type', () => {
			const validator = getTypeValidator('object')
			expect(validator).toBeInstanceOf(Function)
			expect(validator({})).toBe(true)
			expect(validator({ alpha: 'value' })).toBe(true)
			expect(validator(null)).toBe(false)
			expect(validator(undefined)).toBe(false)
			expect(validator([])).toBe(false)
			expect(validator('hello')).toBe(false)
			expect(validator(2)).toBe(false)
		})
		it('should return a validator for "color" type', () => {
			const validator = getTypeValidator('color')
			expect(validator).toBeInstanceOf(Function)
			expect(validator('#000fff')).toBe(true)
			expect(validator('#abcdef')).toBe(true)
			expect(validator('#xxxxxx')).toBe(false)
			expect(validator('123456')).toBe(false)
		})
	})

	describe('verifiable', () => {
		const rules = [
			{ text: 'At least 1 upper case letter', pattern: /[A-Z]+/ },
			{ text: 'At least 1 lower case letter', pattern: /[a-z]+/ },
			{ text: 'At least 1 number', pattern: /[0-9]+/ },
			{ text: 'At least 1 symbol [!@#$]', pattern: /[!@#\$]+/ },
			{ text: 'At least 8 characters long', pattern: /.{8,}/ }
		]
		const initialValidations = [
			{ text: 'At least 1 upper case letter', valid: false },
			{ text: 'At least 1 lower case letter', valid: true },
			{ text: 'At least 1 number', valid: false },
			{ text: 'At least 1 symbol [!@#$]', valid: false },
			{ text: 'At least 8 characters long', valid: false }
		]

		it('should create a validation store with initial value and rules', () => {
			const value = 'example'
			const store = verifiable(value, rules)

			expect(store).toBeDefined()
			expect(store.subscribe).toBeDefined()
			expect(store.update).toBeDefined()

			let currentValue = get(store)

			expect(currentValue.value).toBe(value)
			expect(currentValue.status).toBe('error')
			expect(currentValue.isValid).toBe(false)
			expect(currentValue.validations).toHaveLength(5)
			expect(currentValue.validations).toEqual(initialValidations)
		})

		it('should update the validation store with a new value', () => {
			const value = 'example'
			const store = verifiable(value, rules)

			let currentValue = get(store)
			expect(currentValue.value).toBe(value)
			expect(currentValue.status).toBe('error')
			expect(currentValue.isValid).toBe(false)
			expect(currentValue.validations).toHaveLength(5)
			expect(currentValue.validations).toEqual(initialValidations)

			store.update('newExample')
			currentValue = get(store)

			expect(currentValue.value).toBe('newExample')
			expect(currentValue.status).toBe('error')
			expect(currentValue.validations).toHaveLength(5)
			expect(currentValue.isValid).toBe(false)
			expect(currentValue.validations).toEqual([
				{ text: 'At least 1 upper case letter', valid: true },
				{ text: 'At least 1 lower case letter', valid: true },
				{ text: 'At least 1 number', valid: false },
				{ text: 'At least 1 symbol [!@#$]', valid: false },
				{ text: 'At least 8 characters long', valid: true }
			])

			store.update('Example1!')
			currentValue = get(store)

			expect(currentValue.value).toBe('Example1!')
			expect(currentValue.status).toBe('success')
			expect(currentValue.validations).toHaveLength(5)
			expect(currentValue.isValid).toBe(true)
			expect(currentValue.validations).toEqual([
				{ text: 'At least 1 upper case letter', valid: true },
				{ text: 'At least 1 lower case letter', valid: true },
				{ text: 'At least 1 number', valid: true },
				{ text: 'At least 1 symbol [!@#$]', valid: true },
				{ text: 'At least 8 characters long', valid: true }
			])
		})

		it('should handle optional rules', () => {
			let optionalRules = rules
			optionalRules[1].optional = true

			const store = verifiable('EXAMPLE1!', optionalRules)
			let currentValue = get(store)

			expect(currentValue.value).toBe('EXAMPLE1!')
			expect(currentValue.status).toBe('warning')
			expect(currentValue.validations).toHaveLength(5)
			expect(currentValue.isValid).toBe(false)
			expect(currentValue.validations).toEqual([
				{ text: 'At least 1 upper case letter', valid: true },
				{ text: 'At least 1 lower case letter', valid: false, optional: true },
				{ text: 'At least 1 number', valid: true },
				{ text: 'At least 1 symbol [!@#$]', valid: true },
				{ text: 'At least 8 characters long', valid: true }
			])
		})

		it('should handle lower/upper bound', () => {
			const store = verifiable(0, [
				{ text: 'Should be numeric', type: 'number' },
				{ text: 'Should be >= 5', min: 5 },
				{ text: 'Should be <= 10', max: 10 }
			])
			let currentValue = get(store)
			expect(currentValue.status).toBe('error')
			expect(currentValue.validations).toEqual([
				{ text: 'Should be numeric', valid: true },
				{ text: 'Should be >= 5', valid: false },
				{ text: 'Should be <= 10', valid: true }
			])

			store.update(7)
			currentValue = get(store)
			expect(currentValue.status).toBe('success')
			expect(currentValue.validations).toEqual([
				{ text: 'Should be numeric', valid: true },
				{ text: 'Should be >= 5', valid: true },
				{ text: 'Should be <= 10', valid: true }
			])
			store.update(11)
			currentValue = get(store)
			expect(currentValue.status).toBe('error')
			expect(currentValue.validations).toEqual([
				{ text: 'Should be numeric', valid: true },
				{ text: 'Should be >= 5', valid: true },
				{ text: 'Should be <= 10', valid: false }
			])
		})

		it('should handle custom validation', () => {
			const store = verifiable('example', [
				{
					text: 'Should be "example"',
					validator: (value) => value === 'example'
				}
			])
			let currentValue = get(store)
			expect(currentValue.status).toBe('success')
			expect(currentValue.validations).toEqual([
				{ text: 'Should be "example"', valid: true }
			])

			store.update('not example')
			currentValue = get(store)
			expect(currentValue.status).toBe('error')
			expect(currentValue.validations).toEqual([
				{ text: 'Should be "example"', valid: false }
			])
		})
		it('should throw error for invalid rule', () => {
			expect(() => {
				verifiable('example', [{ text: 'Invalid rule' }])
			}).toThrow(/Invalid rule/)
		})
	})
})
