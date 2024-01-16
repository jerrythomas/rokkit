import { data } from './data'
import { deriveNestedSchema } from '@rokkit/organisms'

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	return {
		data,
		fields: {
			text: 'key',
			icon: 'type'
		},
		schema: deriveNestedSchema(data)
	}
}
