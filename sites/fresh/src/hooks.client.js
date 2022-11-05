import { logger } from '$lib';
// hooks client only allows handleError

/** @type {import('@sveltejs/kit').HandleClientError} */
export async function handleError({ error, event }) {
	await logger.error({
		file: 'hooks.client.js',
		method: 'handleError',
		path: event.url.pathname,
		hash: event.url.hash,
		error
	});

	return {
		message: 'Whoops!'
		// code: error.code ?? 'UNKNOWN',
		// path: event.url.pathname,
		// hash: event.url.hash
	};
}
