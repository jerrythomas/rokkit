import { logger } from '$lib';

/** @type {import('./$types').PageLoad} */
export async function load({ url }) {
	await logger.info({ file: '/page.js', method: 'load', path: url.pathname });
	return { what: 'page' };
}
