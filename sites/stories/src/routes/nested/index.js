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

/** @type {import('./__types').RequestHandler}  */
export async function GET() {
	return {
		status: 200,
		headers: {},
		body: { variants }
	}
}
