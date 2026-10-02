/* Which interpreter answers a message. Measured on 22 messages (journal 2026-10-02): the local
 * interpreter scored 18 and System One 16, failing on different messages — local wins when a
 * message names things outright, System One when the wording is vague ("bigger rows please").
 * So a direct local reading answers at once, and only the rest go to the server; if the server
 * fails, the local search answers.
 */
import type { Interpretation, Screen } from './types'
import { interpretLocally, readDirectly } from './local'

export type Backend = 'local' | 'systemone'

export type Context = {
	screen: Screen | null
	/** What the user said before, for the server's context. */
	recent?: string[]
	fetcher?: typeof fetch
}

/** The screen as the server is told it: what is on screen, never the data it holds. */
const summaryOf = (screen: Screen | null) =>
	screen ? { demo: screen.demo, ...(screen.variant ? { variant: screen.variant } : {}), props: screen.props } : null

async function askServer(message: string, { screen, recent = [], fetcher = fetch }: Context): Promise<Interpretation> {
	const res = await fetcher('/api/chat/interpret', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ message, screen: summaryOf(screen), recent })
	})
	if (!res.ok) throw new Error(`interpret ${res.status}`)
	return (await res.json()).interpretation as Interpretation
}

export async function interpretWith(backend: Backend, message: string, context: Context): Promise<Interpretation> {
	const direct = readDirectly(message, context.screen)
	if (direct) return direct
	if (backend === 'local') return interpretLocally(message, context.screen)
	try {
		return await askServer(message, context)
	} catch {
		return interpretLocally(message, context.screen)
	}
}
