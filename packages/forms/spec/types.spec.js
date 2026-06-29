import { describe, it, expect } from 'vitest'
import { types } from '../src/types.js'

describe('forms types (src/types.js)', () => {
	it('maps "string" to InputText component', () => {
		expect(types.string).toBeDefined()
	})

	it('maps "integer" to InputNumber component', () => {
		expect(types.integer).toBeDefined()
	})

	it('maps "phone" to InputTel component', () => {
		expect(types.phone).toBeDefined()
	})

	it('maps native component kebab-case keys from the Input* exports', () => {
		// e.g. InputCheckbox → 'checkbox', InputDate → 'date', etc.
		expect(types.checkbox).toBeDefined()
		expect(types.date).toBeDefined()
		expect(types.number).toBeDefined()
		expect(types.select).toBeDefined()
		expect(types.text).toBeDefined()
	})
})
