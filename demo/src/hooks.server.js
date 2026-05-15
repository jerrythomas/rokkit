import { paraglideMiddleware } from '$lib/paraglide/server.js'
import { getLocale, getTextDirection } from '$lib/paraglide/runtime.js'
import { themeInitScript } from '@rokkit/unocss/hooks'

const initScript = themeInitScript({ storageKey: 'rokkit-site', defaultStyle: 'zen-sumi' })

/** @type {import('@sveltejs/kit').Handle} */
export const handle = ({ event, resolve }) => {
	return paraglideMiddleware(event.request, ({ request }) => {
		event.request = request
		return resolve(event, {
			transformPageChunk({ html }) {
				return html
					.replace(/(<body[^>]*>)/, `$1${initScript}`)
					.replace('%lang%', getLocale())
					.replace('%dir%', getTextDirection())
			}
		})
	})
}
