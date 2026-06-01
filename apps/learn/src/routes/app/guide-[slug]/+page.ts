import { redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'

// Legacy URLs (/app/guide-<slug>) used to mount guides inside the chat
// shell. Guides now live at /guides/<slug>; preserve any inbound link
// continuity with a permanent redirect.
export const load: PageLoad = ({ params }) => {
	redirect(301, `/guides/${params.slug}`)
}
