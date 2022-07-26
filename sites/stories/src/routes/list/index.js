const variants = [
	{
		title: 'Simple Array',
		summary: 'A List can be created by passing an array if strings. ',
		props: { items: ['Alpha', 'Beta', 'Delta'] }
	},
	{
		title: 'Object Array',
		summary:
			'You can also pass an array of objects with a text attribute containing the values to be displayed.',
		props: { items: [{ text: 'One' }, { text: 'Two' }, { text: 'Three' }] }
	},
	{
		title: 'Field Mapping',
		summary:
			'An array of objects can also be passed with a field mapping to indicate which fields should be used for display.',
		props: {
			items: [{ name: 'First' }, { name: 'Second' }, { name: 'Third' }],
			fields: { text: 'name' }
		}
	},
	{
		title: 'Mixed Content',
		summary:
			'Each item can be unique and a different component can be used to display teh content.',
		props: {
			items: [
				{ name: 'Panda', url: '/1', component: 'Link' },
				{ name: 'Monkey' },
				{ name: 'Viper', icon: 'sun', component: 'Link' }
			],
			fields: { text: 'name' }
		}
	}
]

/** @type {import('./__types/').RequestHandler} */
export async function GET() {
	return {
		status: 200,
		headers: {},
		body: { variants }
	}
}
