import tutorials from '$lib/tutorials.json'
import { toSortedHierarchy } from '@rokkit/tutorial'

/** @type {import('../../lab/$types').LayoutServerLoad} */
export async function load() {
	return {
		menu: toSortedHierarchy(tutorials)
	}
}
