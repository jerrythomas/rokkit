import { paraglideMiddleware } from '$lib/paraglide/server'
import rtlDetect from 'rtl-detect'

/** @type {import('@sveltejs/kit').Handle} */
const handleParaglide = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.textDirection%', rtlDetect.getLangDir(locale))
		})
	})

/** @type {import('@sveltejs/kit').Handle} */
export const handle = handleParaglide
