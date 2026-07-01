import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SvelteSet } from 'svelte/reactivity'
import { FormBuilder } from '../../src/lib/builder.svelte.js'

describe('FormBuilder', () => {
	let formBuilder

	beforeEach(() => {
		formBuilder = null
	})

	describe('constructor', () => {
		it('should initialize with basic data', () => {
			const data = { count: 25, distance: 150 }
			formBuilder = new FormBuilder(data)

			expect(formBuilder.data).toEqual(data)
			expect(formBuilder.schema).toEqual({
				properties: {
					count: {
						type: 'integer'
					},
					distance: {
						type: 'integer'
					}
				},
				type: 'object'
			})
			expect(formBuilder.layout).toEqual({
				type: 'vertical',
				elements: [
					{ label: 'count', scope: '#/count' },
					{ label: 'distance', scope: '#/distance' }
				]
			})
			expect(formBuilder.elements).toEqual([
				{
					override: false,
					props: { label: 'count', message: null, dirty: false, type: 'number' },
					scope: '#/count',
					type: 'number',
					value: 25
				},
				{
					override: false,
					props: { label: 'distance', message: null, dirty: false, type: 'number' },
					scope: '#/distance',
					type: 'number',
					value: 150
				}
			])
		})

		it('should initialize with custom schema', () => {
			const data = { count: 25 }
			const schema = {
				type: 'object',
				properties: {
					count: { type: 'integer', min: 10, max: 100 }
				}
			}
			formBuilder = new FormBuilder(data, schema)

			expect(formBuilder.data).toEqual(data)
			expect(formBuilder.schema).toEqual(schema)
		})

		it('should initialize with custom layout', () => {
			const data = { count: 25 }
			const layout = {
				type: 'vertical',
				elements: [{ label: 'Count', scope: '#/count' }]
			}
			formBuilder = new FormBuilder(data, null, layout)

			expect(formBuilder.data).toEqual(data)
			expect(formBuilder.layout).toEqual(layout)
		})

		it('should initialize with empty data by default', () => {
			formBuilder = new FormBuilder()

			expect(formBuilder.data).toEqual({})
			expect(formBuilder.schema).toBeDefined()
			expect(formBuilder.layout).toBeDefined()
		})

		// ── layout/schema fallback matrix ────────────────────────────
		// FormRenderer should handle every combination of the three inputs
		// (data / schema / layout). When a slot is omitted the builder must
		// derive it — and when a schema is provided, it must override any
		// layout that would have been derived from (possibly-empty) data.
		//
		// Regression from the demo: an LLM emits a form with
		//   data: {}, schema: { properties: { … } }
		// and no layout. Previously the builder derived the layout from
		// empty data (zero elements) instead of from the schema, so every
		// declared field silently vanished — only the submit button rendered.

		describe('schema/layout fallback matrix', () => {
			const schemaTwoFields = {
				type: 'object',
				properties: {
					priority: { type: 'string' },
					description: { type: 'string' }
				}
			}

			it('data only — derives both schema and layout from data', () => {
				const data = { priority: 'med', description: 'X' }
				const fb = new FormBuilder(data)
				expect(fb.schema.properties.priority).toBeDefined()
				expect(fb.schema.properties.description).toBeDefined()
				expect(fb.layout.elements.map((e) => e.scope)).toEqual([
					'#/priority',
					'#/description'
				])
				expect(fb.elements.map((e) => e.scope)).toEqual(['#/priority', '#/description'])
			})

			it('data + schema — schema wins; layout derived from schema (not empty data)', () => {
				const fb = new FormBuilder({}, schemaTwoFields)
				expect(fb.schema).toEqual(schemaTwoFields)
				// Critical: even though data is {}, the layout must reflect the schema.
				expect(fb.layout.elements.map((e) => e.scope)).toEqual([
					'#/priority',
					'#/description'
				])
				expect(fb.elements).toHaveLength(2)
			})

			it('data + schema with partial data — still renders every schema field', () => {
				// Practical LLM output: some fields have seed values, others don't.
				const fb = new FormBuilder({ priority: 'high' }, schemaTwoFields)
				expect(fb.elements.map((e) => e.scope)).toEqual(['#/priority', '#/description'])
			})

			it('data + layout — layout wins; schema derived from data', () => {
				const layout = {
					type: 'vertical',
					elements: [{ label: 'Name', scope: '#/name' }]
				}
				const fb = new FormBuilder({ name: 'Jerry' }, null, layout)
				expect(fb.layout).toEqual(layout)
				expect(fb.schema.properties.name).toBeDefined()
				expect(fb.elements).toHaveLength(1)
				expect(fb.elements[0].scope).toBe('#/name')
			})

			it('data + schema + layout — both explicit values win', () => {
				const layout = {
					type: 'vertical',
					elements: [{ label: 'Priority', scope: '#/priority' }]
				}
				const fb = new FormBuilder({}, schemaTwoFields, layout)
				expect(fb.schema).toEqual(schemaTwoFields)
				expect(fb.layout).toEqual(layout)
				// Layout drives which fields render — schema's second field is
				// deliberately not laid out here.
				expect(fb.elements.map((e) => e.scope)).toEqual(['#/priority'])
			})

			it('assigning schema after construction re-derives an implicit layout', () => {
				const fb = new FormBuilder({})
				expect(fb.layout.elements).toHaveLength(0)
				fb.schema = schemaTwoFields
				expect(fb.layout.elements.map((e) => e.scope)).toEqual([
					'#/priority',
					'#/description'
				])
			})

			it('assigning schema after construction does NOT clobber an explicit layout', () => {
				const explicitLayout = {
					type: 'vertical',
					elements: [{ label: 'Custom', scope: '#/priority' }]
				}
				const fb = new FormBuilder({}, null, explicitLayout)
				fb.schema = schemaTwoFields
				expect(fb.layout).toEqual(explicitLayout)
			})
		})
	})

	describe('getters and setters', () => {
		beforeEach(() => {
			formBuilder = new FormBuilder({ count: 25 })
		})

		it('should get and set data', () => {
			const newData = { distance: 150, animate: true }
			formBuilder.data = newData

			expect(formBuilder.data).toEqual(newData)
		})

		it('should get and set schema', () => {
			const newSchema = {
				type: 'object',
				properties: {
					distance: { type: 'number', minimum: 50, maximum: 200 }
				}
			}
			formBuilder.schema = newSchema

			expect(formBuilder.schema).toEqual(newSchema)
		})

		it('should get and set layout', () => {
			const newLayout = {
				type: 'horizontal',
				elements: [{ label: 'Distance', scope: '#/distance' }]
			}
			formBuilder.layout = newLayout

			expect(formBuilder.layout).toEqual(newLayout)
		})
	})

	describe('updateField', () => {
		beforeEach(() => {
			formBuilder = new FormBuilder({ count: 25, distance: 150 })
		})

		it('should update simple field', () => {
			formBuilder.updateField('count', 50)

			expect(formBuilder.data.count).toBe(50)
			expect(formBuilder.data.distance).toBe(150) // Should remain unchanged
		})

		it('should update nested field', () => {
			formBuilder.data = { settings: { count: 25, distance: 150 } }
			formBuilder.updateField('settings/count', 50)

			expect(formBuilder.data.settings.count).toBe(50)
			expect(formBuilder.data.settings.distance).toBe(150)
		})

		it('should create immutable updates', () => {
			const originalData = formBuilder.data
			formBuilder.updateField('count', 50)

			expect(formBuilder.data).not.toBe(originalData)
			expect(formBuilder.data.count).toBe(50)
		})
	})

	describe('getValue', () => {
		beforeEach(() => {
			formBuilder = new FormBuilder({
				count: 25,
				settings: {
					distance: 150,
					color: '#22d3ee'
				}
			})
		})

		it('should get simple field value', () => {
			expect(formBuilder.getValue('count')).toBe(25)
		})

		it('should get nested field value', () => {
			expect(formBuilder.getValue('settings/distance')).toBe(150)
			expect(formBuilder.getValue('settings/color')).toBe('#22d3ee')
		})

		it('should return undefined for non-existent field', () => {
			expect(formBuilder.getValue('nonexistent')).toBeUndefined()
			expect(formBuilder.getValue('settings/nonexistent')).toBeUndefined()
		})
	})

	describe('elements derivation', () => {
		it('should create elements for number fields with range type', () => {
			const data = { count: 25 }
			const schema = {
				type: 'object',
				properties: {
					count: { type: 'integer', min: 10, max: 100 }
				}
			}
			const layout = {
				type: 'vertical',
				elements: [{ label: 'Count', scope: '#/count' }]
			}

			formBuilder = new FormBuilder(data, schema, layout)
			const elements = formBuilder.elements

			expect(elements).toHaveLength(1)
			expect(elements[0]).toMatchObject({
				// label: 'Count',
				scope: '#/count',
				// type: 'range',
				value: 25
				// constraints: {
				// 	min: 10,
				// 	max: 100,
				// 	step: 1
				// }
			})
		})

		it('should create elements for boolean fields with checkbox type', () => {
			const data = { animate: true }
			const schema = {
				type: 'object',
				properties: {
					animate: { type: 'boolean' }
				}
			}
			const layout = {
				type: 'vertical',
				elements: [{ label: 'Animate', scope: '#/animate' }]
			}

			formBuilder = new FormBuilder(data, schema, layout)
			const elements = formBuilder.elements

			expect(elements).toHaveLength(1)
			expect(elements[0]).toMatchObject({
				// label: 'Animate',
				scope: '#/animate',
				// type: 'checkbox',
				value: true
			})
		})

		it('should create elements for string enum fields with select type', () => {
			const data = { color: '#22d3ee' }
			const schema = {
				type: 'object',
				properties: {
					color: {
						type: 'string',
						enum: ['#22d3ee', '#ef4444', '#10b981']
					}
				}
			}
			const layout = {
				type: 'vertical',
				elements: [{ label: 'Color', scope: '#/color' }]
			}

			formBuilder = new FormBuilder(data, schema, layout)
			const elements = formBuilder.elements

			expect(elements).toHaveLength(1)
			expect(elements[0]).toMatchObject({
				// label: 'Color',
				scope: '#/color',
				// type: 'select',
				value: '#22d3ee'
				// constraints: {
				// 	options: ['#22d3ee', '#ef4444', '#10b981']
				// }
			})
		})

		it('should create number input for numbers without min/max', () => {
			const data = { value: 42 }
			const schema = {
				type: 'object',
				properties: {
					value: { type: 'number' }
				}
			}
			const layout = {
				type: 'vertical',
				elements: [{ label: 'Value', scope: '#/value' }]
			}

			formBuilder = new FormBuilder(data, schema, layout)
			const elements = formBuilder.elements

			expect(elements).toHaveLength(1)
			expect(elements[0]).toMatchObject({
				// label: 'Value',
				scope: '#/value',
				// type: 'number',
				value: 42
			})
		})

		it('should handle multiple elements', () => {
			const data = { count: 25, animate: true, color: 'blue' }
			const layout = {
				type: 'vertical',
				elements: [
					{ label: 'Count', scope: '#/count' },
					{ label: 'Animate', scope: '#/animate' },
					{ label: 'Color', scope: '#/color' }
				]
			}

			formBuilder = new FormBuilder(data, null, layout)
			const elements = formBuilder.elements

			expect(elements).toHaveLength(3)
			expect(elements.map((e) => e.scope)).toEqual(['#/count', '#/animate', '#/color'])
		})
	})

	describe('reset', () => {
		it('should restore data to initial snapshot', () => {
			formBuilder = new FormBuilder({ count: 25 }, { type: 'object' }, { type: 'vertical' })

			formBuilder.updateField('count', 99)
			formBuilder.reset()

			expect(formBuilder.data).toEqual({ count: 25 })
			expect(formBuilder.schema).toEqual({ type: 'object' })
			expect(formBuilder.layout).toEqual({ type: 'vertical' })
		})

		it('should clear validation on reset', () => {
			const schema = {
				type: 'object',
				properties: { name: { type: 'string', required: true } }
			}
			const layout = {
				type: 'vertical',
				elements: [{ label: 'Name', scope: '#/name' }]
			}
			formBuilder = new FormBuilder({ name: '' }, schema, layout)
			formBuilder.validate()
			expect(formBuilder.isValid).toBe(false)

			formBuilder.reset()
			expect(formBuilder.isValid).toBe(true)
			expect(formBuilder.validation).toEqual({})
		})
	})

	describe('edge cases', () => {
		it('should handle empty layout elements', () => {
			formBuilder = new FormBuilder({ count: 25 }, null, { type: 'vertical', elements: [] })

			expect(formBuilder.elements).toEqual([])
		})

		it('should handle layout without elements', () => {
			formBuilder = new FormBuilder({ count: 25 }, null, { type: 'vertical' })

			expect(formBuilder.elements).toEqual([])
		})

		it('should handle element without scope as separator', () => {
			formBuilder = new FormBuilder({ count: 25 }, null, {
				type: 'vertical',
				elements: [{ label: 'Invalid' }] // No scope → treated as separator
			})

			expect(formBuilder.elements).toEqual([
				{
					type: 'separator',
					scope: null,
					value: null,
					override: false,
					props: { label: 'Invalid' }
				}
			])
		})

		// it('should handle schema without properties', () => {
		// 	formBuilder = new FormBuilder(
		// 		{ count: 25 },
		// 		{ type: 'object' }, // No properties
		// 		{
		// 			type: 'vertical',
		// 			elements: [{ label: 'Count', scope: '#/count' }]
		// 		}
		// 	)

		// 	const elements = formBuilder.elements
		// 	expect(elements).toHaveLength(1)
		// 	expect(elements[0].type).toBe('text') // Default type
		// })
	})

	describe('validateField', () => {
		it('should return error for required field with empty value', () => {
			const schema = {
				type: 'object',
				properties: { name: { type: 'string', required: true } }
			}
			const layout = {
				type: 'vertical',
				elements: [{ label: 'Name', scope: '#/name' }]
			}
			formBuilder = new FormBuilder({ name: '' }, schema, layout)

			const result = formBuilder.validateField('name')
			expect(result).toEqual({ state: 'error', text: 'Name is required' })
			expect(formBuilder.validation.name).toEqual(result)
		})

		it('should clear validation when field becomes valid', () => {
			const schema = {
				type: 'object',
				properties: { name: { type: 'string', required: true } }
			}
			const layout = {
				type: 'vertical',
				elements: [{ label: 'Name', scope: '#/name' }]
			}
			formBuilder = new FormBuilder({ name: '' }, schema, layout)

			formBuilder.validateField('name')
			expect(formBuilder.validation.name).toBeTruthy()

			formBuilder.updateField('name', 'Alice')
			const result = formBuilder.validateField('name')
			expect(result).toBeNull()
			expect(formBuilder.validation.name).toBeUndefined()
		})

		it('should validate min/max on number fields', () => {
			const schema = {
				type: 'object',
				properties: { age: { type: 'integer', min: 18, max: 120 } }
			}
			const layout = {
				type: 'vertical',
				elements: [{ label: 'Age', scope: '#/age' }]
			}
			formBuilder = new FormBuilder({ age: 5 }, schema, layout)

			const result = formBuilder.validateField('age')
			expect(result.state).toBe('error')
		})

		it('should validate string pattern', () => {
			const schema = {
				type: 'object',
				properties: { email: { type: 'string', pattern: '^[^@]+@[^@]+$' } }
			}
			const layout = {
				type: 'vertical',
				elements: [{ label: 'Email', scope: '#/email' }]
			}
			formBuilder = new FormBuilder({ email: 'not-an-email' }, schema, layout)

			const result = formBuilder.validateField('email')
			expect(result.state).toBe('error')
		})

		it('should return null when no schema for field', () => {
			formBuilder = new FormBuilder({ name: 'Alice' })

			const result = formBuilder.validateField('nonexistent')
			expect(result).toBeNull()
		})

		it('should return null for valid field', () => {
			const schema = {
				type: 'object',
				properties: { name: { type: 'string', required: true } }
			}
			const layout = {
				type: 'vertical',
				elements: [{ label: 'Name', scope: '#/name' }]
			}
			formBuilder = new FormBuilder({ name: 'Alice' }, schema, layout)

			const result = formBuilder.validateField('name')
			expect(result).toBeNull()
		})
	})

	describe('validate', () => {
		it('should validate all fields and populate validation state', () => {
			const schema = {
				type: 'object',
				properties: {
					name: { type: 'string', required: true },
					email: { type: 'string', pattern: '^[^@]+@[^@]+$' }
				}
			}
			const layout = {
				type: 'vertical',
				elements: [
					{ label: 'Name', scope: '#/name' },
					{ label: 'Email', scope: '#/email' }
				]
			}
			formBuilder = new FormBuilder({ name: '', email: 'bad' }, schema, layout)

			const results = formBuilder.validate()
			expect(Object.keys(results)).toHaveLength(2)
			expect(results.name.state).toBe('error')
			expect(results.email.state).toBe('error')
		})

		it('should return empty object when all fields are valid', () => {
			const schema = {
				type: 'object',
				properties: { name: { type: 'string' } }
			}
			const layout = {
				type: 'vertical',
				elements: [{ label: 'Name', scope: '#/name' }]
			}
			formBuilder = new FormBuilder({ name: 'Alice' }, schema, layout)

			const results = formBuilder.validate()
			expect(Object.keys(results)).toHaveLength(0)
		})
	})

	describe('validate() with showWhen', () => {
		const schema = {
			properties: {
				accountType: { type: 'string' },
				companyName: { type: 'string', required: true }
			}
		}

		it('does not produce errors for hidden required fields', () => {
			const layout = {
				elements: [
					{ scope: '#/accountType', label: 'Account Type' },
					{
						scope: '#/companyName',
						label: 'Company Name',
						showWhen: { field: 'accountType', equals: 'business' }
					}
				]
			}
			const builder = new FormBuilder(
				{
					accountType: 'personal',
					companyName: ''
				},
				schema,
				layout
			)
			builder.validate()
			expect(builder.isValid).toBe(true)
		})

		it('does produce errors for visible required fields', () => {
			const layout = {
				elements: [
					{ scope: '#/accountType', label: 'Account Type' },
					{
						scope: '#/companyName',
						label: 'Company Name',
						showWhen: { field: 'accountType', equals: 'business' }
					}
				]
			}
			const builder = new FormBuilder(
				{
					accountType: 'business',
					companyName: ''
				},
				schema,
				layout
			)
			builder.validate()
			expect(builder.isValid).toBe(false)
		})
	})

	describe('isValid', () => {
		it('should return true when no validation errors', () => {
			formBuilder = new FormBuilder({ name: 'Alice' })
			expect(formBuilder.isValid).toBe(true)
		})

		it('should return false after validation finds errors', () => {
			const schema = {
				type: 'object',
				properties: { name: { type: 'string', required: true } }
			}
			const layout = {
				type: 'vertical',
				elements: [{ label: 'Name', scope: '#/name' }]
			}
			formBuilder = new FormBuilder({ name: '' }, schema, layout)
			formBuilder.validate()

			expect(formBuilder.isValid).toBe(false)
		})

		it('should return true after clearing validation', () => {
			const schema = {
				type: 'object',
				properties: { name: { type: 'string', required: true } }
			}
			const layout = {
				type: 'vertical',
				elements: [{ label: 'Name', scope: '#/name' }]
			}
			formBuilder = new FormBuilder({ name: '' }, schema, layout)
			formBuilder.validate()
			formBuilder.clearValidation()

			expect(formBuilder.isValid).toBe(true)
		})
	})

	describe('errors', () => {
		it('should return array of error messages with paths', () => {
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
			formBuilder = new FormBuilder({ name: '', age: -5 }, schema, layout)
			formBuilder.validate()

			const errors = formBuilder.errors
			expect(errors).toHaveLength(2)
			expect(errors[0]).toHaveProperty('path')
			expect(errors[0]).toHaveProperty('text')
			expect(errors[0].state).toBe('error')
		})

		it('should return empty array when no errors', () => {
			formBuilder = new FormBuilder({ name: 'Alice' })
			expect(formBuilder.errors).toEqual([])
		})
	})

	describe('dirty tracking', () => {
		it('should not be dirty on fresh builder', () => {
			formBuilder = new FormBuilder({ name: 'Alice', age: 30 })

			expect(formBuilder.isDirty).toBe(false)
			expect(formBuilder.dirtyFields.size).toBe(0)
		})

		it('should be dirty after updateField', () => {
			formBuilder = new FormBuilder({ name: 'Alice', age: 30 })

			formBuilder.updateField('name', 'Bob')

			expect(formBuilder.isDirty).toBe(true)
		})

		it('should track individual dirty fields', () => {
			formBuilder = new FormBuilder({ name: 'Alice', age: 30 })

			formBuilder.updateField('name', 'Bob')

			expect(formBuilder.isFieldDirty('name')).toBe(true)
			expect(formBuilder.isFieldDirty('age')).toBe(false)
			expect(formBuilder.dirtyFields).toEqual(new SvelteSet(['name']))
		})

		it('should track multiple dirty fields', () => {
			formBuilder = new FormBuilder({ name: 'Alice', age: 30 })

			formBuilder.updateField('name', 'Bob')
			formBuilder.updateField('age', 25)

			expect(formBuilder.dirtyFields).toEqual(new SvelteSet(['name', 'age']))
		})

		it('should become clean when value reverts to initial', () => {
			formBuilder = new FormBuilder({ name: 'Alice', age: 30 })

			formBuilder.updateField('name', 'Bob')
			expect(formBuilder.isDirty).toBe(true)

			formBuilder.updateField('name', 'Alice')
			expect(formBuilder.isDirty).toBe(false)
			expect(formBuilder.isFieldDirty('name')).toBe(false)
		})

		it('should handle nested path dirty tracking', () => {
			formBuilder = new FormBuilder({ settings: { theme: 'dark', size: 10 } })

			formBuilder.updateField('settings/theme', 'light')

			expect(formBuilder.isDirty).toBe(true)
			expect(formBuilder.isFieldDirty('settings/theme')).toBe(true)
			expect(formBuilder.isFieldDirty('settings/size')).toBe(false)
		})

		it('should clear dirty after snapshot', () => {
			formBuilder = new FormBuilder({ name: 'Alice' })

			formBuilder.updateField('name', 'Bob')
			expect(formBuilder.isDirty).toBe(true)

			formBuilder.snapshot()
			expect(formBuilder.isDirty).toBe(false)
			expect(formBuilder.dirtyFields.size).toBe(0)
		})

		it('should be dirty relative to snapshot, not original', () => {
			formBuilder = new FormBuilder({ name: 'Alice' })

			formBuilder.updateField('name', 'Bob')
			formBuilder.snapshot()

			// Now revert to original — should be dirty relative to snapshot
			formBuilder.updateField('name', 'Alice')
			expect(formBuilder.isDirty).toBe(true)
			expect(formBuilder.isFieldDirty('name')).toBe(true)
		})

		it('should clear dirty after reset', () => {
			formBuilder = new FormBuilder({ name: 'Alice' })

			formBuilder.updateField('name', 'Bob')
			expect(formBuilder.isDirty).toBe(true)

			formBuilder.reset()
			expect(formBuilder.isDirty).toBe(false)
			expect(formBuilder.data).toEqual({ name: 'Alice' })
		})

		it('should include dirty flag in element props', () => {
			const schema = {
				type: 'object',
				properties: {
					name: { type: 'string' },
					age: { type: 'integer' }
				}
			}
			const layout = {
				type: 'vertical',
				elements: [
					{ label: 'Name', scope: '#/name' },
					{ label: 'Age', scope: '#/age' }
				]
			}
			formBuilder = new FormBuilder({ name: 'Alice', age: 30 }, schema, layout)

			formBuilder.updateField('name', 'Bob')

			const nameEl = formBuilder.elements.find((e) => e.scope === '#/name')
			const ageEl = formBuilder.elements.find((e) => e.scope === '#/age')
			expect(nameEl.props.dirty).toBe(true)
			expect(ageEl.props.dirty).toBe(false)
		})

		it('should not mutate initial data when updating fields', () => {
			const original = { name: 'Alice', items: [1, 2, 3] }
			formBuilder = new FormBuilder(original)

			formBuilder.updateField('name', 'Bob')

			// Original object should not be affected by structuredClone
			expect(original.name).toBe('Alice')
		})

		it('should handle empty initial data', () => {
			formBuilder = new FormBuilder()

			expect(formBuilder.isDirty).toBe(false)
			expect(formBuilder.dirtyFields.size).toBe(0)
		})

		it('should detect new fields as dirty', () => {
			formBuilder = new FormBuilder({ name: 'Alice' })

			formBuilder.updateField('email', 'alice@example.com')

			expect(formBuilder.isDirty).toBe(true)
			expect(formBuilder.dirtyFields.has('email')).toBe(true)
		})
	})

	describe('display elements', () => {
		it('should build display-section element from layout', () => {
			const data = {
				user: { name: 'Alice', age: 30 }
			}
			const schema = {
				type: 'object',
				properties: { user: { type: 'object' } }
			}
			const layout = {
				type: 'vertical',
				elements: [
					{
						type: 'display-section',
						scope: '#/user',
						title: 'User Info',
						fields: [
							{ key: 'name', label: 'Name' },
							{ key: 'age', label: 'Age' }
						]
					}
				]
			}
			formBuilder = new FormBuilder(data, schema, layout)

			expect(formBuilder.elements).toHaveLength(1)
			expect(formBuilder.elements[0].type).toBe('display-section')
			expect(formBuilder.elements[0].value).toEqual({ name: 'Alice', age: 30 })
			expect(formBuilder.elements[0].props.title).toBe('User Info')
			expect(formBuilder.elements[0].props.fields).toHaveLength(2)
		})

		it('should build display-table element from layout', () => {
			const data = {
				items: [
					{ id: 1, name: 'A' },
					{ id: 2, name: 'B' }
				]
			}
			const schema = {
				type: 'object',
				properties: { items: { type: 'array' } }
			}
			const layout = {
				type: 'vertical',
				elements: [
					{
						type: 'display-table',
						scope: '#/items',
						columns: [
							{ key: 'id', label: 'ID' },
							{ key: 'name', label: 'Name' }
						]
					}
				]
			}
			formBuilder = new FormBuilder(data, schema, layout)

			expect(formBuilder.elements).toHaveLength(1)
			expect(formBuilder.elements[0].type).toBe('display-table')
			expect(formBuilder.elements[0].value).toEqual(data.items)
		})

		it('should build display element without scope', () => {
			const layout = {
				type: 'vertical',
				elements: [
					{
						type: 'display-section',
						title: 'Static',
						fields: [{ key: 'x', label: 'X' }]
					}
				]
			}
			formBuilder = new FormBuilder({}, { type: 'object' }, layout)

			expect(formBuilder.elements).toHaveLength(1)
			expect(formBuilder.elements[0].type).toBe('display-section')
			expect(formBuilder.elements[0].value).toBeNull()
			expect(formBuilder.elements[0].scope).toBeNull()
		})

		it('should mix display and input elements', () => {
			const data = { name: 'Alice', info: { role: 'Eng' } }
			const schema = {
				type: 'object',
				properties: {
					name: { type: 'string' },
					info: { type: 'object' }
				}
			}
			const layout = {
				type: 'vertical',
				elements: [
					{ label: 'Name', scope: '#/name' },
					{
						type: 'display-section',
						scope: '#/info',
						fields: [{ key: 'role', label: 'Role' }]
					}
				]
			}
			formBuilder = new FormBuilder(data, schema, layout)

			expect(formBuilder.elements).toHaveLength(2)
			expect(formBuilder.elements[0].type).toBe('text')
			expect(formBuilder.elements[1].type).toBe('display-section')
		})

		it('should support renderer hint overriding type', () => {
			const data = { rating: 4 }
			const schema = {
				type: 'object',
				properties: { rating: { type: 'number' } }
			}
			const layout = {
				type: 'vertical',
				elements: [{ label: 'Rating', scope: '#/rating', renderer: 'star-rating' }]
			}
			formBuilder = new FormBuilder(data, schema, layout)

			expect(formBuilder.elements[0].type).toBe('star-rating')
		})
	})

	describe('group elements', () => {
		it('should build group element for nested object', () => {
			const data = {
				name: 'Alice',
				address: { street: '123 Main St', city: 'Springfield' }
			}
			const schema = {
				type: 'object',
				properties: {
					name: { type: 'string' },
					address: {
						type: 'object',
						properties: {
							street: { type: 'string' },
							city: { type: 'string' }
						}
					}
				}
			}
			const layout = {
				type: 'vertical',
				elements: [
					{ label: 'Name', scope: '#/name' },
					{
						scope: '#/address',
						label: 'Address',
						elements: [
							{ scope: '#/address/street', label: 'Street' },
							{ scope: '#/address/city', label: 'City' }
						]
					}
				]
			}
			formBuilder = new FormBuilder(data, schema, layout)

			expect(formBuilder.elements).toHaveLength(2)
			expect(formBuilder.elements[0].type).toBe('text')
			expect(formBuilder.elements[0].scope).toBe('#/name')

			const group = formBuilder.elements[1]
			expect(group.type).toBe('group')
			expect(group.scope).toBe('#/address')
			expect(group.value).toEqual({ street: '123 Main St', city: 'Springfield' })
			expect(group.props.label).toBe('Address')
			expect(group.props.elements).toHaveLength(2)
			expect(group.props.elements[0].scope).toBe('#/address/street')
			expect(group.props.elements[0].type).toBe('text')
			expect(group.props.elements[0].value).toBe('123 Main St')
			expect(group.props.elements[1].scope).toBe('#/address/city')
			expect(group.props.elements[1].value).toBe('Springfield')
		})

		it('should support getValue and updateField for nested paths', () => {
			const data = {
				address: { street: '123 Main St', city: 'Springfield' }
			}
			const schema = {
				type: 'object',
				properties: {
					address: {
						type: 'object',
						properties: {
							street: { type: 'string' },
							city: { type: 'string' }
						}
					}
				}
			}
			const layout = {
				type: 'vertical',
				elements: [
					{
						scope: '#/address',
						elements: [
							{ scope: '#/address/street', label: 'Street' },
							{ scope: '#/address/city', label: 'City' }
						]
					}
				]
			}
			formBuilder = new FormBuilder(data, schema, layout)

			expect(formBuilder.getValue('address/street')).toBe('123 Main St')

			formBuilder.updateField('address/city', 'Shelbyville')
			expect(formBuilder.getValue('address/city')).toBe('Shelbyville')
			expect(formBuilder.data.address.city).toBe('Shelbyville')
		})

		it('should track dirty state for nested group fields', () => {
			const data = {
				address: { street: '123 Main St', city: 'Springfield' }
			}
			const schema = {
				type: 'object',
				properties: {
					address: {
						type: 'object',
						properties: {
							street: { type: 'string' },
							city: { type: 'string' }
						}
					}
				}
			}
			const layout = {
				type: 'vertical',
				elements: [
					{
						scope: '#/address',
						elements: [
							{ scope: '#/address/street', label: 'Street' },
							{ scope: '#/address/city', label: 'City' }
						]
					}
				]
			}
			formBuilder = new FormBuilder(data, schema, layout)

			expect(formBuilder.isDirty).toBe(false)

			formBuilder.updateField('address/street', '456 Oak Ave')
			expect(formBuilder.isDirty).toBe(true)
			expect(formBuilder.isFieldDirty('address/street')).toBe(true)
			expect(formBuilder.isFieldDirty('address/city')).toBe(false)
		})

		it('should support deeply nested groups', () => {
			const data = {
				person: {
					name: 'Alice',
					address: { street: '123 Main', city: 'Springfield' }
				}
			}
			const schema = {
				type: 'object',
				properties: {
					person: {
						type: 'object',
						properties: {
							name: { type: 'string' },
							address: {
								type: 'object',
								properties: {
									street: { type: 'string' },
									city: { type: 'string' }
								}
							}
						}
					}
				}
			}
			const layout = {
				type: 'vertical',
				elements: [
					{
						scope: '#/person',
						label: 'Person',
						elements: [
							{ scope: '#/person/name', label: 'Name' },
							{
								scope: '#/person/address',
								label: 'Address',
								elements: [
									{ scope: '#/person/address/street', label: 'Street' },
									{ scope: '#/person/address/city', label: 'City' }
								]
							}
						]
					}
				]
			}
			formBuilder = new FormBuilder(data, schema, layout)

			const personGroup = formBuilder.elements[0]
			expect(personGroup.type).toBe('group')
			expect(personGroup.scope).toBe('#/person')
			expect(personGroup.props.elements).toHaveLength(2)

			// First child is a text field
			expect(personGroup.props.elements[0].type).toBe('text')
			expect(personGroup.props.elements[0].scope).toBe('#/person/name')

			// Second child is a nested group
			const addressGroup = personGroup.props.elements[1]
			expect(addressGroup.type).toBe('group')
			expect(addressGroup.scope).toBe('#/person/address')
			expect(addressGroup.props.elements).toHaveLength(2)
			expect(addressGroup.props.elements[0].scope).toBe('#/person/address/street')
			expect(addressGroup.props.elements[1].scope).toBe('#/person/address/city')
		})
	})

	describe('messages getter', () => {
		it('should return all validation messages with paths', () => {
			formBuilder = new FormBuilder(
				{ name: '', age: 5 },
				{
					type: 'object',
					properties: {
						name: { type: 'string', required: true },
						age: { type: 'integer', minimum: 18 }
					}
				},
				{
					type: 'vertical',
					elements: [
						{ scope: '#/name', label: 'Name' },
						{ scope: '#/age', label: 'Age' }
					]
				}
			)
			formBuilder.validate()

			const messages = formBuilder.messages
			expect(messages).toHaveLength(2)
			expect(messages.every((m) => m.path && m.state && m.text)).toBe(true)
			expect(messages[0].path).toBe('name')
			expect(messages[1].path).toBe('age')
		})

		it('should order messages by severity: error first, then warning, info, success', () => {
			formBuilder = new FormBuilder({ name: 'Alice' })

			// Manually set mixed-severity validation
			formBuilder.validation = {
				a: { state: 'info', text: 'Info msg' },
				b: { state: 'error', text: 'Error msg' },
				c: { state: 'warning', text: 'Warning msg' },
				d: { state: 'success', text: 'Success msg' }
			}

			const messages = formBuilder.messages
			expect(messages).toHaveLength(4)
			expect(messages[0].state).toBe('error')
			expect(messages[1].state).toBe('warning')
			expect(messages[2].state).toBe('info')
			expect(messages[3].state).toBe('success')
		})

		it('should return empty array when no validation messages', () => {
			formBuilder = new FormBuilder({ name: 'Alice' })
			expect(formBuilder.messages).toEqual([])
		})

		it('should filter out null entries', () => {
			formBuilder = new FormBuilder({ name: 'Alice' })
			formBuilder.validation = {
				name: null,
				email: { state: 'error', text: 'Required' }
			}

			expect(formBuilder.messages).toHaveLength(1)
			expect(formBuilder.messages[0].path).toBe('email')
		})
	})

	describe('stable instance', () => {
		it('should preserve validation state when data is updated via setter', () => {
			const schema = {
				type: 'object',
				properties: { name: { type: 'string', required: true } }
			}
			const layout = {
				type: 'vertical',
				elements: [{ label: 'Name', scope: '#/name' }]
			}
			formBuilder = new FormBuilder({ name: '' }, schema, layout)
			formBuilder.validateField('name')

			// Simulate what $effect does: update data via setter
			formBuilder.data = { name: '' }

			// Validation should be preserved
			expect(formBuilder.validation.name).toBeTruthy()
		})

		it('should reflect validation messages in elements', () => {
			const schema = {
				type: 'object',
				properties: { name: { type: 'string', required: true } }
			}
			const layout = {
				type: 'vertical',
				elements: [{ label: 'Name', scope: '#/name' }]
			}
			formBuilder = new FormBuilder({ name: '' }, schema, layout)
			formBuilder.validateField('name')

			const element = formBuilder.elements[0]
			expect(element.props.message).toEqual({ state: 'error', text: 'Name is required' })
		})
	})

	describe('conditional fields — showWhen', () => {
		const schema = {
			properties: {
				accountType: { type: 'string' },
				companyName: { type: 'string' }
			}
		}

		it('includes field with no showWhen condition', () => {
			const layout = { elements: [{ scope: '#/accountType', label: 'Account Type' }] }
			const builder = new FormBuilder({ accountType: 'personal' }, schema, layout)
			expect(builder.elements.some((el) => el.scope === '#/accountType')).toBe(true)
		})

		it('includes field when showWhen equals condition is met', () => {
			const layout = {
				elements: [
					{ scope: '#/accountType', label: 'Account Type' },
					{
						scope: '#/companyName',
						label: 'Company Name',
						showWhen: { field: 'accountType', equals: 'business' }
					}
				]
			}
			const builder = new FormBuilder({ accountType: 'business' }, schema, layout)
			expect(builder.elements.some((el) => el.scope === '#/companyName')).toBe(true)
		})

		it('excludes field when showWhen equals condition is not met', () => {
			const layout = {
				elements: [
					{ scope: '#/accountType', label: 'Account Type' },
					{
						scope: '#/companyName',
						label: 'Company Name',
						showWhen: { field: 'accountType', equals: 'business' }
					}
				]
			}
			const builder = new FormBuilder({ accountType: 'personal' }, schema, layout)
			expect(builder.elements.some((el) => el.scope === '#/companyName')).toBe(false)
		})

		it('excludes field when showWhen notEquals condition is not met', () => {
			const layout = {
				elements: [
					{ scope: '#/accountType', label: 'Account Type' },
					{
						scope: '#/companyName',
						label: 'Company Name',
						showWhen: { field: 'accountType', notEquals: 'personal' }
					}
				]
			}
			const builder = new FormBuilder({ accountType: 'personal' }, schema, layout)
			expect(builder.elements.some((el) => el.scope === '#/companyName')).toBe(false)
		})

		it('includes field when showWhen notEquals condition is met', () => {
			const layout = {
				elements: [
					{ scope: '#/accountType', label: 'Account Type' },
					{
						scope: '#/companyName',
						label: 'Company Name',
						showWhen: { field: 'accountType', notEquals: 'personal' }
					}
				]
			}
			const builder = new FormBuilder({ accountType: 'business' }, schema, layout)
			expect(builder.elements.some((el) => el.scope === '#/companyName')).toBe(true)
		})

		it('does not affect separators when showWhen conditions are present', () => {
			const layout = {
				elements: [
					{ type: 'separator' },
					{
						scope: '#/companyName',
						label: 'Company Name',
						showWhen: { field: 'accountType', equals: 'business' }
					}
				]
			}
			const builder = new FormBuilder({ accountType: 'personal' }, schema, layout)
			expect(builder.elements.some((el) => el.type === 'separator')).toBe(true)
		})
	})

	describe('getVisibleData()', () => {
		const schema = {
			properties: {
				accountType: { type: 'string' },
				companyName: { type: 'string' },
				personalBio: { type: 'string' }
			}
		}

		it('returns all field values when no fields are hidden', () => {
			const layout = {
				elements: [
					{ scope: '#/accountType', label: 'Account Type' },
					{ scope: '#/companyName', label: 'Company Name' }
				]
			}
			const builder = new FormBuilder(
				{ accountType: 'business', companyName: 'Acme' },
				schema,
				layout
			)
			expect(builder.getVisibleData()).toEqual({ accountType: 'business', companyName: 'Acme' })
		})

		it('excludes hidden field keys from returned data', () => {
			const layout = {
				elements: [
					{ scope: '#/accountType', label: 'Account Type' },
					{
						scope: '#/companyName',
						label: 'Company Name',
						showWhen: { field: 'accountType', equals: 'business' }
					}
				]
			}
			const builder = new FormBuilder(
				{ accountType: 'personal', companyName: 'Acme' },
				schema,
				layout
			)
			expect(builder.getVisibleData()).toEqual({ accountType: 'personal' })
		})

		it('includes visible field keys in returned data', () => {
			const layout = {
				elements: [
					{ scope: '#/accountType', label: 'Account Type' },
					{
						scope: '#/companyName',
						label: 'Company Name',
						showWhen: { field: 'accountType', equals: 'business' }
					}
				]
			}
			const builder = new FormBuilder(
				{ accountType: 'business', companyName: 'Acme' },
				schema,
				layout
			)
			expect(builder.getVisibleData()).toEqual({ accountType: 'business', companyName: 'Acme' })
		})

		it('does not mutate #data when called', () => {
			const layout = {
				elements: [
					{ scope: '#/accountType', label: 'Account Type' },
					{
						scope: '#/companyName',
						label: 'Company Name',
						showWhen: { field: 'accountType', equals: 'business' }
					}
				]
			}
			const data = { accountType: 'personal', companyName: 'Acme' }
			const builder = new FormBuilder(data, schema, layout)
			builder.getVisibleData()
			expect(builder.data).toEqual({ accountType: 'personal', companyName: 'Acme' })
		})
	})

	describe('#clearHiddenValidation()', () => {
		it('clears stale validation errors for fields that become hidden', () => {
			const schema = {
				properties: {
					accountType: { type: 'string' },
					companyName: { type: 'string', required: true }
				}
			}
			const layout = {
				elements: [
					{ scope: '#/accountType', label: 'Account Type' },
					{
						scope: '#/companyName',
						label: 'Company Name',
						showWhen: { field: 'accountType', equals: 'business' }
					}
				]
			}
			const builder = new FormBuilder(
				{
					accountType: 'business',
					companyName: ''
				},
				schema,
				layout
			)
			// Validate to create a stale error on companyName
			builder.validate()
			expect(builder.isValid).toBe(false)
			// Now hide companyName by changing accountType
			builder.updateField('accountType', 'personal')
			// Stale error should be cleared
			expect(builder.isValid).toBe(true)
		})
	})

	describe('isStepValid()', () => {
		const schema = {
			type: 'object',
			properties: {
				firstName: { type: 'string', required: true },
				username: { type: 'string', required: true }
			}
		}
		const layout = {
			type: 'vertical',
			elements: [
				{
					type: 'step',
					label: 'Step 1',
					elements: [{ scope: '#/firstName', label: 'First Name' }]
				},
				{
					type: 'step',
					label: 'Step 2',
					elements: [{ scope: '#/username', label: 'Username' }]
				}
			]
		}

		it('returns false for the current step when required field is empty', () => {
			const builder = new FormBuilder({}, schema, layout)
			expect(builder.isStepValid()).toBe(false)
		})

		it('returns true for the current step when required field is filled', () => {
			const builder = new FormBuilder({ firstName: 'Alice' }, schema, layout)
			expect(builder.isStepValid()).toBe(true)
		})

		it('accepts explicit step index', () => {
			const builder = new FormBuilder({ firstName: 'Alice' }, schema, layout)
			// Step 1 (index 1) has username empty → invalid
			expect(builder.isStepValid(1)).toBe(false)
		})
	})

	describe('lookup integration', () => {
		const schema = {
			type: 'object',
			properties: {
				country: { type: 'string' },
				city: { type: 'string' }
			}
		}
		const layout = {
			type: 'vertical',
			elements: [
				{ scope: '#/country', label: 'Country' },
				{ scope: '#/city', label: 'City' }
			]
		}

		it('isFieldDisabled returns false when no lookup manager exists', () => {
			const builder = new FormBuilder({ country: 'USA' }, schema, layout)
			expect(builder.isFieldDisabled('country')).toBe(false)
		})

		it('isFieldDisabled returns true when deps are not met', async () => {
			const lookups = {
				city: {
					url: '/api/cities?country={country}',
					dependsOn: ['country']
				}
			}
			const builder = new FormBuilder({}, schema, layout, lookups)
			await builder.initializeLookups()
			expect(builder.isFieldDisabled('city')).toBe(true)
		})

		it('isFieldDisabled returns false after deps become met', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([{ id: 1, name: 'NYC' }])
			})
			const lookups = {
				city: {
					url: '/api/cities?country={country}',
					dependsOn: ['country']
				}
			}
			const builder = new FormBuilder({ country: 'USA' }, schema, layout, lookups)
			await builder.initializeLookups()
			expect(builder.isFieldDisabled('city')).toBe(false)
		})

		it('getLookupState returns null when no lookup manager', () => {
			const builder = new FormBuilder({ country: 'USA' }, schema, layout)
			expect(builder.getLookupState('country')).toBeNull()
		})

		it('getLookupState returns null for unknown field', () => {
			const lookups = { city: { url: '/api/cities' } }
			const builder = new FormBuilder({}, schema, layout, lookups)
			expect(builder.getLookupState('country')).toBeNull()
		})

		it('getLookupState returns state object for known field', () => {
			const lookups = { country: { url: '/api/countries' } }
			const builder = new FormBuilder({}, schema, layout, lookups)
			const state = builder.getLookupState('country')
			expect(state).not.toBeNull()
			expect(state).toHaveProperty('options')
			expect(state).toHaveProperty('loading')
			expect(state).toHaveProperty('error')
			expect(state).toHaveProperty('disabled')
			expect(state).toHaveProperty('fields')
		})

		it('refreshLookup fetches with current data', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([{ id: 1, name: 'NYC' }])
			})
			const lookups = {
				city: {
					url: '/api/cities?country={country}',
					dependsOn: ['country']
				}
			}
			const builder = new FormBuilder({ country: 'USA' }, schema, layout, lookups)
			await builder.refreshLookup('city')
			const state = builder.getLookupState('city')
			expect(state.options).toHaveLength(1)
		})

		it('refreshLookup is a no-op when field has no lookup', async () => {
			const builder = new FormBuilder({ country: 'USA' }, schema, layout)
			// Should not throw
			await expect(builder.refreshLookup('country')).resolves.toBeUndefined()
		})

		it('setLookups replaces lookup manager', () => {
			const builder = new FormBuilder({}, schema, layout)
			expect(builder.getLookupState('country')).toBeNull()

			builder.setLookups({ country: { url: '/api/countries' } })
			expect(builder.getLookupState('country')).not.toBeNull()
		})

		it('lookupManager getter returns null without lookups', () => {
			const builder = new FormBuilder({}, schema, layout)
			expect(builder.lookupManager).toBeNull()
		})

		it('lookupManager getter returns manager when lookups are set', () => {
			const builder = new FormBuilder({}, schema, layout, {
				country: { url: '/api/countries' }
			})
			expect(builder.lookupManager).not.toBeNull()
		})

		it('hasLookup returns false when no manager', () => {
			const builder = new FormBuilder({}, schema, layout)
			expect(builder.hasLookup('country')).toBe(false)
		})

		it('hasLookup returns true for known field', () => {
			const builder = new FormBuilder({}, schema, layout, {
				country: { url: '/api/countries' }
			})
			expect(builder.hasLookup('country')).toBe(true)
		})

		it('updateField with lookups=false skips lookup triggering', () => {
			const lookups = {
				city: {
					url: '/api/cities?country={country}',
					dependsOn: ['country']
				}
			}
			const builder = new FormBuilder({ country: '' }, schema, layout, lookups)
			// Should not throw; no fetch calls expected
			builder.updateField('country', 'USA', false)
			expect(builder.data.country).toBe('USA')
		})

		it('updateField clears dependent field value and triggers lookup', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([{ id: 1, name: 'NYC' }])
			})
			const lookups = {
				city: {
					url: '/api/cities?country={country}',
					dependsOn: ['country']
				}
			}
			const builder = new FormBuilder({ country: 'GBR', city: 'London' }, schema, layout, lookups)
			builder.updateField('country', 'USA')
			// city should be cleared (set to null) because it depends on country
			expect(builder.data.city).toBeNull()
		})

		it('lookup state is injected into element props when options are available', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([{ id: 1, name: 'USA' }])
			})
			const lookups = { country: { url: '/api/countries' } }
			const builder = new FormBuilder({ country: '' }, schema, layout, lookups)
			await builder.initializeLookups()

			const countryEl = builder.elements.find((e) => e.scope === '#/country')
			expect(countryEl.props.options).toEqual([{ id: 1, name: 'USA' }])
		})
	})

	describe('combined getter', () => {
		it('returns schema+layout combined object for scoped elements', () => {
			const data = { name: 'Alice', age: 30 }
			const schema = {
				type: 'object',
				properties: {
					name: { type: 'string' },
					age: { type: 'integer' }
				}
			}
			const layout = {
				type: 'vertical',
				elements: [
					{ scope: '#/name', label: 'Name' },
					{ scope: '#/age', label: 'Age' }
				]
			}
			const builder = new FormBuilder(data, schema, layout)
			const combined = builder.combined
			expect(combined).toBeDefined()
			expect(combined.elements).toHaveLength(2)
		})

		it('excludes non-scoped elements from combined', () => {
			const data = { name: 'Alice' }
			const schema = { type: 'object', properties: { name: { type: 'string' } } }
			const layout = {
				type: 'vertical',
				elements: [
					{ type: 'separator' }, // no scope → excluded
					{ scope: '#/name', label: 'Name' }
				]
			}
			const builder = new FormBuilder(data, schema, layout)
			const combined = builder.combined
			expect(combined.elements).toHaveLength(1)
		})
	})

	describe('getValue() — non-object traversal', () => {
		it('returns undefined when traversal encounters a primitive mid-path', () => {
			// data.user is a string, not an object, so getValue('user/name') hits else
			const builder = new FormBuilder({ user: 'Alice' })
			expect(builder.getValue('user/name')).toBeUndefined()
		})
	})

	describe('readonly elements', () => {
		it('renders a readonly schema field as an info element', () => {
			const data = { name: 'Alice' }
			const schema = {
				type: 'object',
				properties: { name: { type: 'string' } }
			}
			const layout = {
				type: 'vertical',
				elements: [{ scope: '#/name', label: 'Name', readonly: true }]
			}
			const builder = new FormBuilder(data, schema, layout)
			const elements = builder.elements

			expect(elements).toHaveLength(1)
			expect(elements[0].type).toBe('info')
			expect(elements[0].scope).toBe('#/name')
			expect(elements[0].value).toBe('Alice')
		})

		it('readonly element props include validation message', () => {
			const schema = {
				type: 'object',
				properties: { name: { type: 'string', required: true } }
			}
			const layout = {
				type: 'vertical',
				elements: [{ scope: '#/name', label: 'Name', readonly: true }]
			}
			const builder = new FormBuilder({ name: '' }, schema, layout)
			builder.setFieldValidation('name', { state: 'error', text: 'Name is required' })

			const elements = builder.elements
			expect(elements[0].props.message).toEqual({ state: 'error', text: 'Name is required' })
		})
	})

	describe('#getInitialValue() — non-object traversal', () => {
		it('isFieldDirty returns false safely when initial data has primitive at intermediate path', () => {
			// Start with initial data where 'user' is a string (not an object).
			// #getInitialValue('user/name') hits the else → undefined.
			// deepEqual(undefined, undefined) → true → not dirty.
			const builder = new FormBuilder({ user: 'Alice' })
			// After construction user is 'Alice' (string), then update via data setter
			builder.data = { user: { name: 'Bob' } }
			// #getInitialValue('user/name') traverses 'Alice'['name'] → else → undefined
			expect(builder.isFieldDirty('user/name')).toBe(true)
		})
	})

	describe('#buildBasicElements() — error recovery fallback', () => {
		// A schema whose `properties` is null causes getSchemaWithLayout to throw
		// when iterating over scoped elements — triggering the catch → #buildBasicElements.
		const badSchema = { type: 'object', properties: null }

		it('falls back to basic elements when getSchemaWithLayout throws', () => {
			const data = { name: 'Alice' }
			const layout = {
				type: 'vertical',
				elements: [{ scope: '#/name', label: 'Name' }]
			}
			const builder = new FormBuilder(data, badSchema, layout)

			// The fallback #buildBasicElements path produces a text element
			const elements = builder.elements
			expect(elements).toHaveLength(1)
			expect(elements[0].type).toBe('text')
			expect(elements[0].scope).toBe('#/name')
			expect(elements[0].value).toBe('Alice')
		})

		it('fallback element label uses scope path when no label provided', () => {
			const data = { email: 'a@b.com' }
			const layout = {
				type: 'vertical',
				elements: [{ scope: '#/email' }] // no label
			}
			const builder = new FormBuilder(data, badSchema, layout)

			const elements = builder.elements
			expect(elements).toHaveLength(1)
			expect(elements[0].props.label).toBe('email')
		})

		it('fallback skips non-scoped elements', () => {
			// Mix a scoped element (triggers error + fallback) with a non-scoped separator.
			// In the fallback path, non-scoped elements return null from #buildBasicElement.
			const layout = {
				type: 'vertical',
				elements: [
					{ scope: '#/name', label: 'Name' }, // triggers error (bad schema)
					{ type: 'separator' } // no scope → skipped in fallback
				]
			}
			const builder = new FormBuilder({ name: 'Alice' }, badSchema, layout)

			// Only the scoped element is returned; separator is skipped
			expect(builder.elements).toHaveLength(1)
			expect(builder.elements[0].type).toBe('text')
		})
	})
})
