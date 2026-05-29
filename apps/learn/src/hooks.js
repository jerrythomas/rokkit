import { deLocalizeUrl } from '$lib/paraglide/runtime'

export const reroute = (request) => {
	return deLocalizeUrl(request.url).pathname
}
