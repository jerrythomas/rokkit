export let fields = [
	{ key: 'age', component: 'input', props: { type: 'number', label: 'Age' } },
	{
		key: 'male',
		component: 'checkbox',
		type: 'checkbox',
		props: { label: 'Male?' }
	}
	// {
	// 	key: 'data',
	// 	type: 'array',
	// 	props: {
	// 		fields: [
	// 			{ key: 'name', type: 'text' },
	// 			{ key: 'url', type: 'text' },
	// 			{ key: 'icon', type: 'text' },
	// 			{
	// 				key: 'component',
	// 				type: 'text',
	// 				props: { list: 'input-types', autocomplete: 'on' }
	// 			}
	// 		],
	// 		closeable: true,
	// 		add: true
	// 	}
	// }
]
