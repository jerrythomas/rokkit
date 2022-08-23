const variants = [
	{
		title: 'Object Array',
		summary:
			'Pass an array of objects with a text attribute containing the values to be displayed.',
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

/** @type {import('./$types/').PageServerLoad} */
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
