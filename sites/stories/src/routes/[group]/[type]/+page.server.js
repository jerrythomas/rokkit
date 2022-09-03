import { groups } from './groups'

/** @type {import('./[types]__types').PageServerLoad}  */
export async function load({ params }) {
	if (params.group in groups && params.type in groups[params.group]) {
		return { ...params, ...groups[params.group][params.type] }
	} else {
		return { ...params, message: 'Invalid params' }
	}
}
