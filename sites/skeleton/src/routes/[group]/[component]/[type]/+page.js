import { error } from '@sveltejs/kit'
import { groups } from '$lib/config/model'

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	let props
	if (params.group in groups) {
		props = groups[params.group]
		if (params.component in props) {
			props = props[params.component]
			if ('types' in props && params.type in props.types) {
				props = props.types[params.type]
			} else {
				throw error(
					404,
					`Component "${params.component}" does not support type "${params.type}"`
				)
			}
		} else {
			throw error(
				404,
				`Component "${params.component}" does not exist in group "${params.group}"`
			)
		}
	} else {
		throw error(
			404,
			`Component "${params.component}" does not exist in group "${params.group}"`
		)
	}
	return { props }
}
