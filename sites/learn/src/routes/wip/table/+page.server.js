import { dev } from './dev'
import { uat } from './uat'
import { prod } from './prod'

import { equals } from 'ramda'
import { flattenObject, generateIndex, generateTreeTable } from '@rokkit/organisms'

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	let flat = [
		{ prefix: 'dev', data: flattenObject(dev) },
		{ prefix: 'uat', data: flattenObject(uat) },
		{ prefix: 'prod', data: flattenObject(prod) }
	]
	let paths = [...new Set([...flat.map(({ data }) => Object.keys(data))].flat())]
	let data = paths
		.map((scope) => ({
			scope,
			key: scope.split('/').pop(),
			dev_type: flat[0].data[scope]?.type,
			dev_value: flat[0].data[scope]?.value,
			uat_type: flat[1].data[scope]?.type,
			uat_value: flat[1].data[scope]?.value,
			prod_type: flat[2].data[scope]?.type,
			prod_value: flat[2].data[scope]?.value
		}))
		.map((x) => ({
			...x,
			diff_type: x.dev_type === x.uat_type && x.dev_type === x.prod_type ? 'none' : 'some',
			diff_value:
				equals(x.dev_value, x.uat_value) && equals(x.dev_value, x.prod_value) ? 'none' : 'some'
		}))

		.map((x) => ({
			...x,
			prod_value: ['array', 'object'].includes(x.prod_type) ? '...' : x.prod_value,
			uat_value: ['array', 'object'].includes(x.uat_type) ? '...' : x.uat_value,
			dev_value: ['array', 'object'].includes(x.dev_type) ? '...' : x.dev_value
		}))

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
			{
				key: 'dev',
				label: 'Development',
				width: '1fr',
				fields: { text: 'dev_value', icon: 'dev_type' }
			},
			{
				key: 'uat',
				label: 'Acceptance',
				width: '1fr',
				fields: { text: 'uat_value', icon: 'uat_type' }
			},
			{
				key: 'prod',
				label: 'Production',
				width: '1fr',
				fields: { text: 'prod_value', icon: 'prod_type' }
			}
		]
	}
}
