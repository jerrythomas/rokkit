import { flattenObject, generateIndex } from '@rokkit/organisms/utils'
import { combine, getColumns } from './utils'
import { dev } from './dev'
import { uat } from './uat'
import { prod } from './prod'

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	let flat = [
		{ label: 'development', data: flattenObject(dev) },
		{ label: 'Acceptance', data: flattenObject(uat) },
		{ label: 'production', data: flattenObject(prod) }
	]

	return {
		data: generateIndex(combine(flat)),
		columns: getColumns(flat)
	}
}
