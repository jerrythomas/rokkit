/** @type {import('./$types').LayoutLoad} */
export function load() {
	return {
		version: __APP_VERSION__,
		sections: [
			{ slug: 'guide', title: 'Guide' }
			// { slug: 'labs', title: 'Labs' }
		]
	}
}
