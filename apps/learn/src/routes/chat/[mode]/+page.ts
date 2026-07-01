import { redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'
import { isChatMode } from '$lib/chat-demo/modes'

export const load: PageLoad = ({ params }) => {
	if (!isChatMode(params.mode)) redirect(307, '/chat')
	return { mode: params.mode }
}
