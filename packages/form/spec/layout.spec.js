import { describe, expect, it, vi } from 'vitest'
import { validate, propsFromSchema } from '../src/layout'
// import { personSchema } from './fixtures/person'
import { peopleSchema } from './fixtures/people'
import AJV from 'ajv'
import { clone } from 'ramda'
import { dataTypes } from './fixtures/types'
describe('layout', () => {
	const personSchema = {
		// $id: 'https://example.com/person.schema.json',
		// $schema: 'https://json-schema.org/draft/2020-12/schema',
		title: 'Person',
		type: 'object',
		properties: {
			firstName: {
				type: 'string',
				widget: 'input',
				description: "The person's first name."
			},
			lastName: {
				type: 'string',
				description: "The person's last name."
			},
			age: {
				description:
					'Age in years which must be equal to or greater than zero.',
				type: 'integer',
				minimum: 0
			}
		}
	}

	it.each(dataTypes)('should convert datatype %s', (type, input) => {
		const { schema, expected } = input
		const result = propsFromSchema(schema)
		expect(result).toEqual(expected)
	})

	it('should not change schema when there are no errors', () => {
		const input = {
			firstName: 'John',
			lastName: 'Doe',
			age: 12
		}

		const result = validate(personSchema, input)
		expect(result).toEqual(personSchema)
	})

	it('should update schema with validation errors', () => {
		const input = {
			firstName: 'John',
			lastName: 1,
			age: '12'
		}
		let validatedSchema = clone(personSchema)
		let result = validate(personSchema, input)
		expect(result).toEqual(validatedSchema)

		personSchema.properties.lastName['hasChanged'] = true
		validatedSchema = clone(personSchema)
		validatedSchema.properties.lastName['error'] = 'must be string'
		result = validate(personSchema, input)
		expect(result).toEqual(validatedSchema)

		personSchema.properties.age['hasChanged'] = true
		validatedSchema = clone(personSchema)
		validatedSchema.properties.lastName['error'] = 'must be string'
		validatedSchema.properties.age['error'] = 'must be integer'
		result = validate(personSchema, input)
		expect(result).toEqual(validatedSchema)
	})

	// it('should validate form data', () => {
	// 	const errors = validate(schema, data)
	// })
})
