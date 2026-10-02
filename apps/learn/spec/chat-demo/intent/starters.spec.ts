/* The prompts the chat offers to start with must each open the demo their card promises —
 * the starter hints by kind, and the Simulated mode card's examples.
 */
import { describe, it, expect } from 'vitest'
import { HINTS_BY_KIND } from '../../../src/lib/chat-demo/starter-hints'
import { MODES } from '../../../src/lib/chat-demo/modes'
import { interpretLocally } from '../../../src/lib/chat-demo/intent/local'
import { validate } from '../../../src/lib/chat-demo/intent/validate'

const shows = (prompt: string) => validate(interpretLocally(prompt, null), null)

describe('starter hints', () => {
	const cases = Object.entries(HINTS_BY_KIND).flatMap(([kind, hints]) => hints.map((h) => [h.prompt, kind] as const))
	it.each(cases)('%s → %s', (prompt, kind) => {
		expect(shows(prompt)).toMatchObject({ intent: 'show', demo: kind })
	})
})

describe('the Simulated card’s examples', () => {
	const simulated = MODES.find((m) => m.mode === 'simulated')!
	it.each(simulated.examples)('%s opens a demo', (prompt) => {
		expect(shows(prompt).intent).toBe('show')
	})
})
