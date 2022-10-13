const variants = [
	{
		title: 'Nested array',
		summary: 'A NodeList can be created by passing an array of objects. ',
		props: {
			items: [
				{ id: 1, text: 'Alpha', data: [{ text: 'One' }] },
				{ id: 2, text: 'Beta', data: [{ text: 'One' }, { text: 'Two' }] },
				{ id: 3, text: 'Delta' }
			]
		}
	}
]

/** @type {import('./$types').PageServerLoad} */
export function load() {
	return { variants }
}
