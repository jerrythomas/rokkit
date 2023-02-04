const variants = [
	{
		title: 'Array of objects',
		summary: 'A NodeList can be created by passing an array of objects. ',
		props: {
			items: [{ text: 'Alpha' }, { text: 'Beta' }, { text: 'Delta' }],
			linesVisible: false
		}
	},
	{
		title: 'Nested array',
		summary: 'A NodeList can be created by passing an array of objects. ',
		props: {
			items: [
				{ text: 'Alpha', data: [{ text: 'One' }] },
				{
					text: 'Beta',
					data: [
						{ text: 'One' },
						{ text: 'Two', data: [{ text: 'One' }, { text: 'Two' }] }
					]
				},
				{ text: 'Delta' }
			],
			linesVisible: false
		}
	}
]

/** @type {import('./$types').PageServerLoad}  */
export async function load() {
	throw new Error(
		'@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292699)'
	)
	return {
		status: 200,
		headers: {},
		body: { variants }
	}
}
