import { paraglideMiddleware } from '$lib/paraglide/server.js'
import { getLocale, getTextDirection } from '$lib/paraglide/runtime.js'
import { themeInitScript } from '@rokkit/unocss/hooks'
import { STORAGE_KEY } from '$lib/theme-config'

const initScript = themeInitScript({ storageKey: STORAGE_KEY, defaultStyle: 'zen-sumi' })

/** @type {import('@sveltejs/kit').Handle} */
export const handle = ({ event, resolve }) => {
	return paraglideMiddleware(event.request, ({ request }) => {
		event.request = request
		return resolve(event, {
			transformPageChunk({ html }) {
				// Inject in `<head>` (just before `</head>`) so the script
				// runs before the body element is parsed. The script writes
				// to documentElement.dataset and to body when it exists —
				// CSS selectors `[data-style='X'] descendant` match from the
				// root and the page paints once in the correct skin.
				return html
					.replace(/<\/head>/, `${initScript}</head>`)
					.replace('%lang%', getLocale())
					.replace('%dir%', getTextDirection())
			}
		})
	})
}
