/** @type {import('./$types').PageServerLoad} */
export async function load() {
	return {
		items: ['Fruits', 'Vegetables', 'Nuts', 'Spices']
	}
}
