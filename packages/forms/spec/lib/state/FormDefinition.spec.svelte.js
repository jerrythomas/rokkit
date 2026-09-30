import { describe, it, expect } from 'vitest'
import { FormValues } from '../../../src/lib/state/FormValues.svelte.js'
import { FormDefinition } from '../../../src/lib/state/FormDefinition.svelte.js'

const schema = {
	type: 'object',
	properties: {
		email: { type: 'string' },
		group: { type: 'object', properties: { n: { type: 'number' } } }
	}
}
const scopes = (d) => d.layout.elements.map((e) => e.scope)

describe('FormDefinition', () => {
	it('derives schema and layout from the data when neither is given', () => {
		const d = new FormDefinition(new FormValues({ a: 1 }), null, null)
		expect(Object.keys(d.schema.properties)).toEqual(['a'])
		expect(scopes(d)).toEqual(['#/a'])
	})

	it('derives the layout from a schema with fields, even for empty data', () => {
		const d = new FormDefinition(new FormValues({}), schema, null)
		expect(scopes(d)).toEqual(['#/email', '#/group'])
	})

	it('keeps an explicit layout when the schema changes', () => {
		const layout = { type: 'vertical', elements: [{ scope: '#/email' }] }
		const d = new FormDefinition(new FormValues({}), null, layout)
		d.schema = schema
		expect(scopes(d)).toEqual(['#/email'])
	})

	it('finds a top-level field schema by path, or null', () => {
		const d = new FormDefinition(new FormValues({}), schema, null)
		expect(d.fieldSchema('email')).toEqual({ type: 'string' })
		expect(d.fieldSchema('missing')).toBeNull()
		// A nested path descends into the object's `properties`, as JSON Schema nests them.
		expect(d.fieldSchema('group/n')).toEqual({ type: 'number' })
		expect(
			new FormDefinition(new FormValues({}), { type: 'object' }, null).fieldSchema('x')
		).toBeNull()
	})

	it('labels a field from its layout element — label, then title, then the path', () => {
		const layout = {
			type: 'vertical',
			elements: [
				{ scope: '#/email', label: 'Email' },
				{ scope: '#/group', title: 'Group' }
			]
		}
		const d = new FormDefinition(new FormValues({}), schema, layout)
		expect(d.fieldLabel('email')).toBe('Email')
		expect(d.fieldLabel('group')).toBe('Group')
		expect(d.fieldLabel('other')).toBe('other')
	})

	it('combines schema and the scoped layout elements', () => {
		const layout = {
			type: 'vertical',
			elements: [{ type: 'separator' }, { scope: '#/email', label: 'E' }]
		}
		const d = new FormDefinition(new FormValues({}), schema, layout)
		expect(d.combined.elements.map((e) => e.key)).toEqual(['email'])
	})
})
