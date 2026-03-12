import { describe, it, expect } from 'vitest'
import { validateField, validateAll, createMessage, patterns } from '../../src/lib/validation.js'

describe('validateField', () => {
	it('should return null for valid non-required empty field', () => {
		const result = validateField('', { type: 'string' }, 'Name')
		expect(result).toBeNull()
	})

	it('should return error for required empty field', () => {
		const result = validateField('', { type: 'string', required: true }, 'Name')
		expect(result).toEqual({ state: 'error', text: 'Name is required' })
	})

	it('should return error for required null field', () => {
		const result = validateField(null, { type: 'string', required: true }, 'Email')
		expect(result).toEqual({ state: 'error', text: 'Email is required' })
	})

	it('should return error for required undefined field', () => {
		const result = validateField(undefined, { type: 'string', required: true }, 'Email')
		expect(result).toEqual({ state: 'error', text: 'Email is required' })
	})

	it('should return null when no schema provided', () => {
		const result = validateField('hello', null, 'Field')
		expect(result).toBeNull()
	})

	it('should use default label when none provided', () => {
		const result = validateField('', { type: 'string', required: true })
		expect(result.text).toBe('Field is required')
	})

	describe('string validation', () => {
		it('should validate minLength', () => {
			const result = validateField('ab', { type: 'string', minLength: 3 }, 'Name')
			expect(result).toEqual({ state: 'error', text: 'Name must be at least 3 characters' })
		})

		it('should pass minLength when satisfied', () => {
			const result = validateField('abc', { type: 'string', minLength: 3 }, 'Name')
			expect(result).toBeNull()
		})

		it('should validate maxLength', () => {
			const result = validateField('abcdef', { type: 'string', maxLength: 5 }, 'Name')
			expect(result).toEqual({
				state: 'error',
				text: 'Name must be no more than 5 characters'
			})
		})

		it('should validate pattern', () => {
			const result = validateField(
				'not-email',
				{ type: 'string', pattern: '^[^@]+@[^@]+$' },
				'Email'
			)
			expect(result).toEqual({ state: 'error', text: 'Email format is invalid' })
		})

		it('should pass valid pattern', () => {
			const result = validateField('a@b.com', { type: 'string', pattern: '^[^@]+@[^@]+$' }, 'Email')
			expect(result).toBeNull()
		})

		it('should validate enum', () => {
			const result = validateField(
				'purple',
				{ type: 'string', enum: ['red', 'blue', 'green'] },
				'Color'
			)
			expect(result).toEqual({
				state: 'error',
				text: 'Color must be one of: red, blue, green'
			})
		})

		it('should pass valid enum value', () => {
			const result = validateField(
				'red',
				{ type: 'string', enum: ['red', 'blue', 'green'] },
				'Color'
			)
			expect(result).toBeNull()
		})
	})

	describe('number validation', () => {
		it('should validate minimum (min)', () => {
			const result = validateField(5, { type: 'number', min: 10 }, 'Age')
			expect(result).toEqual({ state: 'error', text: 'Age must be at least 10' })
		})

		it('should validate minimum (minimum)', () => {
			const result = validateField(5, { type: 'number', minimum: 10 }, 'Age')
			expect(result).toEqual({ state: 'error', text: 'Age must be at least 10' })
		})

		it('should validate maximum (max)', () => {
			const result = validateField(200, { type: 'number', max: 150 }, 'Score')
			expect(result).toEqual({ state: 'error', text: 'Score must be no more than 150' })
		})

		it('should validate maximum (maximum)', () => {
			const result = validateField(200, { type: 'number', maximum: 150 }, 'Score')
			expect(result).toEqual({ state: 'error', text: 'Score must be no more than 150' })
		})

		it('should validate integer type', () => {
			const result = validateField(3.5, { type: 'integer' }, 'Count')
			expect(result).toEqual({ state: 'error', text: 'Count must be a whole number' })
		})

		it('should pass valid integer', () => {
			const result = validateField(3, { type: 'integer' }, 'Count')
			expect(result).toBeNull()
		})

		it('should return error for NaN', () => {
			const result = validateField('abc', { type: 'number' }, 'Value')
			expect(result).toEqual({ state: 'error', text: 'Value must be a valid number' })
		})

		it('should pass valid number in range', () => {
			const result = validateField(50, { type: 'number', min: 0, max: 100 }, 'Score')
			expect(result).toBeNull()
		})
	})

	describe('boolean validation', () => {
		it('should validate required mustBeTrue boolean', () => {
			const result = validateField(
				false,
				{ type: 'boolean', required: true, mustBeTrue: true },
				'Terms'
			)
			expect(result).toEqual({ state: 'error', text: 'Terms must be accepted' })
		})

		it('should pass when mustBeTrue and value is true', () => {
			const result = validateField(
				true,
				{ type: 'boolean', required: true, mustBeTrue: true },
				'Terms'
			)
			expect(result).toBeNull()
		})
	})

	it('should return null for unknown schema type', () => {
		const result = validateField('data', { type: 'custom' }, 'Field')
		expect(result).toBeNull()
	})
})

describe('validateAll', () => {
	it('should validate all scoped fields', () => {
		const data = { name: '', age: -5 }
		const schema = {
			type: 'object',
			properties: {
				name: { type: 'string', required: true },
				age: { type: 'integer', min: 0 }
			}
		}
		const layout = {
			type: 'vertical',
			elements: [
				{ label: 'Name', scope: '#/name' },
				{ label: 'Age', scope: '#/age' }
			]
		}

		const results = validateAll(data, schema, layout)
		expect(Object.keys(results)).toHaveLength(2)
		expect(results.name.state).toBe('error')
		expect(results.age.state).toBe('error')
	})

	it('should skip non-scoped elements', () => {
		const data = { name: 'Alice' }
		const schema = {
			type: 'object',
			properties: { name: { type: 'string' } }
		}
		const layout = {
			type: 'vertical',
			elements: [{ type: 'separator' }, { label: 'Name', scope: '#/name' }]
		}

		const results = validateAll(data, schema, layout)
		expect(Object.keys(results)).toHaveLength(0)
	})

	it('should return empty object for valid data', () => {
		const data = { name: 'Alice', age: 25 }
		const schema = {
			type: 'object',
			properties: {
				name: { type: 'string', required: true },
				age: { type: 'integer', min: 0 }
			}
		}
		const layout = {
			type: 'vertical',
			elements: [
				{ label: 'Name', scope: '#/name' },
				{ label: 'Age', scope: '#/age' }
			]
		}

		const results = validateAll(data, schema, layout)
		expect(Object.keys(results)).toHaveLength(0)
	})

	it('should handle missing schema properties gracefully', () => {
		const data = { name: 'Alice' }
		const schema = { type: 'object' }
		const layout = {
			type: 'vertical',
			elements: [{ label: 'Name', scope: '#/name' }]
		}

		const results = validateAll(data, schema, layout)
		expect(Object.keys(results)).toHaveLength(0)
	})

	it('should handle missing layout elements gracefully', () => {
		const data = { name: 'Alice' }
		const schema = {
			type: 'object',
			properties: { name: { type: 'string' } }
		}
		const layout = { type: 'vertical' }

		const results = validateAll(data, schema, layout)
		expect(Object.keys(results)).toHaveLength(0)
	})

	it('should use label from layout element for error messages', () => {
		const data = { email: '' }
		const schema = {
			type: 'object',
			properties: { email: { type: 'string', required: true } }
		}
		const layout = {
			type: 'vertical',
			elements: [{ label: 'Email Address', scope: '#/email' }]
		}

		const results = validateAll(data, schema, layout)
		expect(results.email.text).toBe('Email Address is required')
	})
})

describe('createMessage', () => {
	it('should create field path to message mapping', () => {
		const result = createMessage('email', 'error', 'Email is taken')
		expect(result).toEqual({
			email: { state: 'error', text: 'Email is taken' }
		})
	})

	it('should support different states', () => {
		const warning = createMessage('name', 'warning', 'Name is short')
		expect(warning.name.state).toBe('warning')

		const info = createMessage('code', 'info', 'Auto-generated')
		expect(info.code.state).toBe('info')
	})
})

describe('patterns', () => {
	it('should match valid email', () => {
		expect(patterns.email.test('user@example.com')).toBe(true)
	})

	it('should reject invalid email', () => {
		expect(patterns.email.test('not-an-email')).toBe(false)
	})

	it('should match valid phone', () => {
		expect(patterns.phone.test('+1 (555) 123-4567')).toBe(true)
	})

	it('should match valid URL', () => {
		expect(patterns.url.test('https://example.com')).toBe(true)
	})

	it('should reject invalid URL', () => {
		expect(patterns.url.test('not-a-url')).toBe(false)
	})
})
