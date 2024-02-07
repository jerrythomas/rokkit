import { data } from './data'
import { deriveNestedSchema } from '@rokkit/organisms'
import { schema } from './schema'
import * as fs from 'fs'

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	// const schema = deriveNestedSchema(data)
	// fs.writeFileSync('schema.json', JSON.stringify(schema, null, 2))
	// fs.writeFileSync('data.json', JSON.stringify(data, null, 2))
	// fs.writeFileSync('nestedSchema.json', JSON.stringify(deriveNestedSchema(data), null, 2))

	return {
		data,
		fields: {
			text: 'key',
			icon: 'type'
		},
		schema
	}
}
