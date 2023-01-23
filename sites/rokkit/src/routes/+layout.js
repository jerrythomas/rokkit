// import { version } from '../../package.json'

/** @type {import('./$types').LayoutLoad} */
export function load() {
	return {
		version: __APP_VERSION__,
		sections: [
			{ slug: 'docs', title: 'Docs' }
			// { slug: 'labs', title: 'Labs' }
		]
	}
}
