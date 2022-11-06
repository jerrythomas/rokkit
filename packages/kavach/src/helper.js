/**
 * Checks if the url begins with # after the page path.
 *
 * @param {String} url
 * @returns {boolean}
 */
export function hasAuthParams(url) {
	const params = url.href.slice(`${url.origin}${url.pathname}`.length)

	if (params.startsWith('#') && params.length > 1) {
		const tokens = Object.fromEntries(
			params.split('&').map((kv) => kv.replace(/^#/, '').split('='))
		)

		return 'access_token' in tokens
	}
	return false
}
