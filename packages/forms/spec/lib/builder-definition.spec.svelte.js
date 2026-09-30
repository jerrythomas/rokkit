/**
 * How schema and layout derive each other — pinned before FormBuilder is decomposed.
 *
 * The setters are not plain setters: setting a schema can replace the layout, and a null
 * layout is derived from the schema when it declares fields, else from the data. Each rule
 * below is observable only through the public getters, so it survives the refactor.
 */
import { describe, it, expect } from 'vitest'
import { FormBuilder } from '../../src/lib/builder.svelte.js'

const scopes = (b) => (b.layout.elements ?? []).map((el) => el.scope)
const schema = { type: 'object', properties: { email: { type: 'string' }, age: { type: 'number' } } }
const explicit = { type: 'vertical', elements: [{ scope: '#/age', label: 'Age' }] }

describe('FormBuilder — schema ⇄ layout derivation', () => {
	it('no schema, no layout: both derive from the data', () => {
		const b = new FormBuilder({ name: 'x', count: 1 })
		expect(Object.keys(b.schema.properties)).toEqual(['name', 'count'])
		expect(scopes(b)).toEqual(['#/name', '#/count'])
	})

	it('a schema with empty data: the layout comes from the schema, so declared fields render', () => {
		const b = new FormBuilder({}, schema)
		expect(scopes(b)).toEqual(['#/email', '#/age'])
	})

	it('an explicit layout is kept as given', () => {
		const b = new FormBuilder({}, schema, explicit)
		expect(scopes(b)).toEqual(['#/age'])
	})

	it('setting a schema later re-derives the layout when none was given explicitly', () => {
		const b = new FormBuilder({})
		expect(scopes(b)).toEqual([])
		b.schema = schema
		expect(scopes(b)).toEqual(['#/email', '#/age'])
	})

	it('setting a schema later keeps a non-empty explicit layout', () => {
		const b = new FormBuilder({}, null, explicit)
		b.schema = schema
		expect(scopes(b)).toEqual(['#/age'])
	})

	it('setting a null schema derives it from the current data', () => {
		const b = new FormBuilder({ a: true })
		b.schema = null
		expect(b.schema.properties.a.type).toBe('boolean')
	})

	it('setting a null layout prefers the schema, else the data', () => {
		const withSchema = new FormBuilder({ z: 1 }, schema, explicit)
		withSchema.layout = null
		expect(scopes(withSchema)).toEqual(['#/email', '#/age'])

		const dataOnly = new FormBuilder({ z: 1 }, { type: 'object', properties: {} }, explicit)
		dataOnly.layout = null
		expect(scopes(dataOnly)).toEqual(['#/z'])
	})
})

describe('FormBuilder — validating a nested field', () => {
	it('validateField finds a nested JSON Schema field and validates it', () => {
		const nested = {
			type: 'object',
			properties: { addr: { type: 'object', properties: { city: { type: 'string', required: true } } } }
		}
		const b = new FormBuilder({ addr: {} }, nested)
		expect(b.validateField('addr/city')?.state).toBe('error')
	})
})
