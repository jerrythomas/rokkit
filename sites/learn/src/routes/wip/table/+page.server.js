import { data } from './data'
import { omit } from 'ramda'
import { flattenObject, generateIndex, generateTreeTable } from '@rokkit/organisms'

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	return {
		data: generateTreeTable(data).map((x) =>
			['array', 'object'].includes(x.type) ? omit(['value'], x) : x
		),
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
