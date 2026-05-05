import { paraglideMiddleware } from '$lib/paraglide/server.js'
import { getLocale, getTextDirection } from '$lib/paraglide/runtime.js'

/** @type {import('@sveltejs/kit').Handle} */
export const handle = ({ event, resolve }) => {
	return paraglideMiddleware(event.request, ({ request }) => {
		event.request = request
		return resolve(event, {
			transformPageChunk({ html }) {
				return html
					.replace('%lang%', getLocale())
					.replace('%dir%', getTextDirection())
			}
		})
	})
}
