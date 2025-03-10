/** @type {import('./$types').LayoutLoad} */
export function load() {
	const code = {
		options: [
			{ icon: 'i-app:code-visible', value: 'hidden', label: 'Hide Code' },
			{ icon: 'i-app:code-hidden', value: 'visible', label: 'Show Code' }
		]
	}
	return {
		sections: [],
		app: {
			name: 'Rokkit',
			version: __APP_VERSION__,
			about:
				'Building amazing, interactive applications has never been simpler thanks ' +
				'to an extensive collection of composable components and a variety of ' +
				'utility functions, stores, actions, and themes.'
		},
		config: { code }
	}
}
