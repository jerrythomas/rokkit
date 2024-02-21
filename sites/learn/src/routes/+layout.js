import { guide } from '$lib'

/** @type {import('./$types').LayoutLoad} */
export async function load() {
	guide.assimilate()
	return {
		sections: [],
		// eslint-disable-next-line no-undef
		version: __APP_VERSION__,
		app: {
			name: 'Rokkit',
			about:
				'Building amazing, interactive applications has never been simpler thanks ' +
				'to an extensive collection of composable components and a variety of ' +
				'utility functions, stores, actions, and themes.'
		}
	}
}
