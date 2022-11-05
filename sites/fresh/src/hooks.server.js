import { logger } from '$lib';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	await logger.info({ file: 'hooks.server.js', method: 'handle', path: event.url.pathname });
	// const response = await resolve(event)
	return resolve(event);
}

/** @type {import('@sveltejs/kit').HandleServerError} */
export async function handleError({ error, event }) {
	await logger.error({
		file: 'hooks.server.js',
		method: 'handle',
		path: event.url.pathname,
		hash: event.url.hash,
		error
	});

	return {
		message: 'Whoops!'
		// code: error.code ?? 'UNKNOWN'
	};
}
