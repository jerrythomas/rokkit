import { describe, it, expect } from 'vitest'
import { FormValues } from '../../../src/lib/state/FormValues.svelte.js'
import { FormDefinition } from '../../../src/lib/state/FormDefinition.svelte.js'
import { FormSteps } from '../../../src/lib/state/FormSteps.svelte.js'
import { FormValidation } from '../../../src/lib/state/FormValidation.svelte.js'

const schema = {
	type: 'object',
	properties: { name: { type: 'string', required: true }, age: { type: 'number', min: 18 } },
	required: ['name']
}
const flat = { type: 'vertical', elements: [{ scope: '#/name', label: 'Name' }, { scope: '#/age' }] }
const stepped = {
	type: 'vertical',
	elements: [
		{ type: 'step', elements: [{ scope: '#/name' }] },
		{ type: 'step', elements: [{ scope: '#/age' }] }
	]
}
const make = ({ data = {}, layout = flat, visible = ['name', 'age'] } = {}) => {
	const values = new FormValues(data)
	const definition = new FormDefinition(values, schema, layout)
	const steps = new FormSteps(definition)
	return { values, v: new FormValidation({ values, definition, steps, visiblePaths: () => visible }) }
}

describe('FormValidation — messages', () => {
	it('sets, clears and reads messages, and derives isValid / errors / messages', () => {
		const { v } = make()
		v.set('name', { state: 'error', text: 'Required' })
		v.set('age', { state: 'warning', text: 'Young' })
		expect(v.message('name').text).toBe('Required')
		expect(v.message('nope')).toBeNull()
		expect(v.isValid).toBe(false)
		expect(v.errors).toEqual([{ path: 'name', state: 'error', text: 'Required' }])
		expect(v.sorted.map((m) => m.path)).toEqual(['name', 'age'])
		v.set('name', null)
		expect(v.isValid).toBe(true)
		v.clear()
		expect(v.map).toEqual({})
	})

	it('orders messages error, warning, info, success, then anything else', () => {
		const { v } = make()
		v.map = { a: { state: 'success' }, b: { state: 'odd' }, c: { state: 'error' }, d: { state: 'info' }, e: null }
		expect(v.sorted.map((m) => m.path)).toEqual(['c', 'd', 'a', 'b'])
	})
})

describe('FormValidation — validating', () => {
	it('validates one field against its schema, labelled from the layout', () => {
		const { v } = make({ data: {} })
		const result = v.validateField('name')
		expect(result?.state).toBe('error')
		expect(v.message('name')?.state).toBe('error')
		expect(v.validateField('unknown')).toBeNull()
	})

	it('validates everything visible, dropping hidden fields’ results', () => {
		const { v } = make({ data: { age: 3 }, visible: ['age'] })
		const results = v.validateAll()
		expect(Object.keys(results)).toEqual(['age'])
	})

	it('validates every step of a multi-step form at once', () => {
		const { v } = make({ data: {}, layout: stepped, visible: ['name'] })
		expect(Object.keys(v.validateAll()).sort()).toContain('name')
	})

	it('validates one step, touching only its fields', () => {
		const { v } = make({ data: { age: 30 }, layout: stepped })
		v.set('age', { state: 'error', text: 'stale' })
		expect(v.validateStep(0)).toBe(false)
		expect(v.message('name')?.state).toBe('error')
		expect(v.message('age')?.text).toBe('stale')
		expect(v.validateStep(1)).toBe(true)
		expect(v.message('age')).toBeNull()
		expect(v.validateStep(9)).toBe(true)
	})

	it('drops messages for fields that are no longer visible', () => {
		const { v } = make({ visible: ['age'] })
		v.set('name', { state: 'error', text: 'x' })
		v.set('age', { state: 'error', text: 'y' })
		v.clearHidden()
		expect(Object.keys(v.map)).toEqual(['age'])
	})
})
