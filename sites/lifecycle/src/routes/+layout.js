import { logger } from '$lib';
/** @type {import('./$types').LayoutLoad} */
export async function load({ url }) {
	await logger.info({ file: '/layout.js', method: 'load', path: url.pathname });
	return { what: 'layout', path: url.pathname };
}
