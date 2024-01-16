import { data } from './data'
import { flattenObject, generateIndex, generateTreeTable } from '@rokkit/organisms'

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	return {
		data: generateTreeTable(data),
		columns: [
			{
				key: 'scope',
				label: 'path',
				width: '3fr',
				fields: { text: 'key' },
				path: true
			},
			{ key: 'value', label: 'value', width: '1fr', fields: { text: 'value', icon: 'type' } }
		]
	}
}
