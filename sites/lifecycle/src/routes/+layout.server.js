import { logger } from '$lib';

/** @type {import('./$types').LayoutServerLoad} */
export async function load(event) {
	await logger.info({
		file: '/layout.server.js',
		method: 'load',
		path: event.url.pathname
		// hash: event.url.hash
	});
	return {};
}
